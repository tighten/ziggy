<?php

namespace Tightenco\Ziggy;

use Illuminate\View\Compilers\BladeCompiler;

class NoCacheBladeCompiler extends BladeCompiler
{
	public function isExpired($path)
	{
		return true;
	}
}
