var approot = process.cwd();

var path = require('path');
var join = path.join;
var fs = require('fs');

var mkdirp = require('mkdirp');
var glob = require('glob');

var Logger = require('./lib/Logger');
var logger;

function escapeReg (source) {
	return String(source)
		.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\\x241');
}

function extend(target, blocks, options) {
	var template = fs.readFileSync(target, {encoding: options.encoding});
	var result = template;
	blocks = blocks || {};
	var pieces;

	var layout = template.split('{{!<');
	layout = layout.length > 1 ? layout[1].split('}}')[0].trim() : null;
	if (layout) {
		logger.info('This template has a layout as %s', layout);
		// 如果检测到layout，分析blocks并交给上一层layout继续分析
		result = result.replace(new RegExp(escapeReg('{{!<') + '\\s*' + escapeReg(layout) + '\\s*' + escapeReg('}}')), '');
		if (layout.lastIndexOf(options.ext) != layout.length - options.ext.length) {
			layout += options.ext;
		}
		logger.info('Mapped layout file to %s', layout);

		pieces = result.trim().split('{{+');
		if (pieces.length > 1) {
			pieces.shift();
			pieces.forEach(function (block) {
				var nameLength = block.indexOf('}}');
				var name = block.slice(0, nameLength).trim();
				if (!blocks[name]) {
					blocks[name] = block.substring(nameLength + 2, block.lastIndexOf('{{/'));
				}
			});
		}

		// blocks = {b1: 'pieces', b2: 'pieces'}
		result = extend(join(options.layouts, layout), blocks, options);
	} else {
		// 没有检测到layout，则认为是顶层，替换掉blocks
		pieces = template.trim().split('{{+');
		if (pieces.length > 1) {
			result = pieces.shift() + pieces.map(function (block) {
				var nameLength = block.indexOf('}}');
				var name = block.slice(0, nameLength).trim();
				logger.info('Processing block [%s]', name);
				if (!blocks[name]) {
					blocks[name] = block.substring(nameLength + 2, block.lastIndexOf('{{/'));
				}
				return blocks[name] + block.split(
					new RegExp(escapeReg('{{/') + '\\s*' + escapeReg(name) + '\\s*' + escapeReg('}}'))
				)[1];
			}).join('');
		}
	}

	return result;
}

function resolve(tpl, options) {
	var name = path.basename(tpl);
	logger.info('Starting to process template', name);
	// 顺便解决掉partials
	var result = extend(tpl, {}, options).replace(/\{\{>\s*([^\}\s]+)\s*\}\}/g, function (matcher, partial) {
		var ret = '<!-- Warning: partial "' + partial + '" file is not exist. -->';
		if (~partial.lastIndexOf(options.ext)) {
			partial = partial.substring(0, -options.ext.length);
		}
		var file = options.partials[partial];
		if (file) {
			ret = fs.readFileSync(file, {encoding: options.encoding});
		}
		return ret;
	});

	// 替换结果缓存到`/views/cache/targets`目录，文件名中路径层级`/`替换为`-`
	var targetFile = join(options.cache, name);
	var targetPath = path.dirname(targetFile);
	if (!fs.existsSync(targetPath)) {
		logger.info('Making directory %s', targetPath);
		mkdirp.sync(targetPath);
	}

	logger.info('Writing resolved template to cache target: %s', targetFile);

	fs.writeFileSync(targetFile, result);
	logger.info('Wrote target successfully.');
}

function cacheFilter (item) {
	return !~item.indexOf(this.cache);
}

exports.engine = function (app, config) {
	logger = new Logger(!!config.verbose); // default is false (undefined)
	var cachePath = join(approot, config.cache || join(config.views, 'cache'));
	var targetsPath = join(cachePath, 'targets');
	if (!fs.existsSync(targetsPath)) {
		logger.info('Targets cache folder %s does not exist, try creating...', targetsPath);
		mkdirp.sync(targetsPath);
	}

	var options = {
		engine: config.engine,
		ext: config.ext.charAt(0) == '.' ? config.ext : '.' + config.ext,
		views: config.views,
		layouts: join(approot, config.layouts || config.views),
		partials: {},
		cache: targetsPath,
		encoding: config.encoding || 'utf8'
	};

	// preparing partials
	var partialsPath = join(approot, config.partials || config.views).replace(/\\/g, '/');
	var RE = new RegExp('^' + escapeReg(partialsPath) + '/|\\' + options.ext + '$', 'g');
	logger.info('Reading partials path %s', partialsPath);
	var partials = glob.sync(partialsPath + '/**/*' + options.ext).filter(cacheFilter, options);
	partials.forEach(function (file) {
		var partPath = file.replace(RE, '');
		logger.info('Preparing template partial "%s" at %s', partPath, file);
		options.partials[partPath] = file;
	});
	if (partials && partials.length) {
		logger.info('%d partials found and prepared.', partials.length);
	} else {
		logger.info('No partial file in folder.');
	}

	// pre-compiling all targets
	var resolved = glob.sync(join(approot, options.views) + '/**/*' + options.ext).filter(cacheFilter, options);
	resolved.forEach(function (item) {
		resolve(item, options);
	});
	logger.info('%d templates resolved.', resolved.length);

	// configurate express view engine
	app.engine(options.ext, options.engine);
	app.set('view engine', options.ext);
	app.set('views', targetsPath);
};
