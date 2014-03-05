<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>MustLayout</title>
</head>
<body>

<div id="header">

<h1>Template in deep folder</h1>

</div>

<div id="main">

<h2>Supporting:</h2>
<ul>
{{#list}}
	<li>{{.}}</li>
{{/list}}
</ul>

</div>

<div id="footer">&copy; Copyright 2014. All right reserved.</div>


</body>
</html>