<?php
try {
    $user = \App\Models\User::first();
    \Auth::login($user);

    $req = Request::create('/api/v1/respuestas/1/pdf', 'GET');
    $req->headers->set('Accept', 'application/json');
    $res = app()->handle($req);

    echo $res->getContent();
} catch (\Exception $e) {
    echo 'ERROR: ' . $e->getMessage();
}
