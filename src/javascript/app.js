// Prism for syntax highlighting
require('prismjs');
require('prismjs/components/prism-php');
require('prismjs/components/prism-bash');

// load jQuery, bootstrap, Popper.js
try {
    window.$ = window.jQuery = require('jquery');
	window.Popper = require('popper.js').default;
    require('bootstrap');
} catch (e) {}

// Sidebar scrollspy
$('body').scrollspy({ target: '#docs-sidebar' });

// Sidebar links animations
var $root = $('html, body');
$('a[href^="#"]').click(function () {
    $root.animate({
        scrollTop: $( $.attr(this, 'href') ).offset().top
    }, 500);
    return false;
});
