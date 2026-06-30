<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Respuesta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class ReporteController extends Controller
{
    public function exportPdf(Request $request, Respuesta $respuesta)
    {
        $respuesta->load([
            'formulario',
            'usuario',
            'proyecto',
            'area',
            'detalles.campo',
            'participantes',
            'aprobaciones.rolFirma',
            'aprobaciones.usuario',
        ]);

        $codigo = $respuesta->formulario->codigo;
        $viewName = 'pdf.' . str_replace('-', '_', $codigo);

        // Map the details into a simple key-value array for easier access in blade
        $datos = is_array($respuesta->datos) ? $respuesta->datos : [];
        foreach ($respuesta->detalles as $detalle) {
            $nombreCampo = $detalle->campo->nombre_campo;
            $datos[$nombreCampo] = $detalle->valor;
        }

        // Check if the specific view exists, otherwise fallback to generic
        if (View::exists($viewName)) {
            $pdf = Pdf::loadView($viewName, [
                'respuesta' => $respuesta,
                'formulario' => $respuesta->formulario,
                'datos' => $datos,
            ])->setPaper('A4', 'portrait');
        } else {
            $pdf = Pdf::loadView('pdf.generic', [
                'respuesta' => $respuesta,
                'formulario' => $respuesta->formulario,
                'datos' => $datos,
            ])->setPaper('A4', 'portrait');
        }

        $filename = $codigo . '_' . $respuesta->id . '.pdf';
        
        return response()->json([
            'filename' => $filename,
            'base64' => base64_encode($pdf->output()),
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
          ->header('Pragma', 'no-cache')
          ->header('Expires', '0');
    }
}
