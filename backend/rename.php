<?php
use App\Models\Formulario;
$f = Formulario::where('codigo', 'FORMATO-08')->first();
if($f) {
    $f->codigo = 'FORMATO-05';
    $f->save();
    echo "Renamed in DB\n";
}
