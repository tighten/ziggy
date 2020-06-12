<?php

Route::get('home', fn () => '')->name('home');

Route::get('posts', fn () => '')->name('posts.index');
Route::get('posts/{post}', fn () => '')->name('posts.show');
Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');
Route::post('posts', fn () => '')->middleware(['auth', 'role:admin'])->name('posts.store');

Route::get('admin/users', fn () => '')->middleware(['role:admin'])->name('admin.users.index');
