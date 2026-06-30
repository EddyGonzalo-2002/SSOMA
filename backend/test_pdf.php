<?php
use App\Models\Respuesta;
use App\Http\Controllers\Api\V1\ReporteController;

try {
    $respuesta = Respuesta::find(1);
    $controller = app()->make(ReporteController::class);
    // Request is needed but we can mock it
    $req = request();
    $pdf = $controller->exportPdf($req, $respuesta);
    echo "PDF Generated!";
} catch (\Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine();
}
