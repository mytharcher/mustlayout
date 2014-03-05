{{!< page }}

{{: header }}
<h1>Template in deep folder</h1>
{{/ header }}

{{: body }}
<h2>Supporting:</h2>
<ul>
{{#list}}
	<li>{{.}}</li>
{{/list}}
</ul>
{{/ body }}
