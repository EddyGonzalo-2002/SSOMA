<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>SST-FOR-017</title>
    <style>
        @page { margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        th, td { border: 1px solid #000; padding: 4px; vertical-align: middle; }
        .header-title { text-align: center; font-weight: bold; }
        .section-header { background-color: #5ab4e5; color: white; font-weight: bold; text-align: center; font-size: 11px; }
        .logo { text-align: center; font-weight: bold; color: #000; font-size: 14px; }
        .logo span { color: #5b2c6f; }
        .logo span.it { color: #e67e22; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .bg-light { background-color: #f2f2f2; }
        .eval-table th { background-color: #5ab4e5; color: white; font-weight: bold; }
        .signature-table td { text-align: center; height: 70px; vertical-align: bottom; padding-bottom: 5px; }
    </style>
</head>
<body>

    <!-- CABECERA -->
    <table>
        <tr>
            <td width="20%" class="logo" rowspan="3">
                <div style="font-size: 16px;"><span>tactical</span><span class="it"> it</span></div>
                <div style="font-size: 6px; font-weight: normal; color: #777;">TECNOLOGÍA QUE TRANSFORMA</div>
            </td>
            <td width="60%" class="header-title" style="font-size: 12px; background-color: #f2f2f2;">
                FORMATO
            </td>
            <td width="20%" style="font-size: 9px;">CÓDIGO: SST-FOR-017</td>
        </tr>
        <tr>
            <td class="header-title" style="font-size: 12px;">INSPECCIÓN DE EXTINTORES</td>
            <td style="font-size: 9px;">Estado: Vigente &nbsp;&nbsp; Versión: 01</td>
        </tr>
        <tr>
            <td class="center" style="font-size: 9px;">Proceso: SST</td>
            <td style="font-size: 9px;">Publicación: 28/02/2025 &nbsp; Página 1 de 1</td>
        </tr>
    </table>

    <!-- OBRA -->
    <table style="background-color: #5ab4e5;">
        <tr>
            <td class="bold">OBRA: {{ mb_strtoupper($respuesta->proyecto->nombre ?? 'N/A') }}</td>
        </tr>
    </table>

    <!-- DATOS DEL EXTINTOR -->
    <table style="width: 50%; float: left; margin-top: 10px;">
        <tr><td class="bold bg-light" width="40%">N° Extintor:</td><td>{{ $datos['num_extintor'] ?? '' }}</td></tr>
        <tr><td class="bold bg-light">Tipo de Carga y/o Agente extintor:</td><td>{{ mb_strtoupper($datos['tipo_carga'] ?? '') }}</td></tr>
        <tr><td class="bold bg-light">Peso:</td><td>{{ $datos['peso'] ?? '' }}</td></tr>
        <tr><td class="bold bg-light">Ubicación exacta:</td><td>{{ mb_strtoupper($datos['ubicacion'] ?? '') }}</td></tr>
        <tr><td class="bold bg-light">Vencimiento de Prueba Hidrostatica:</td><td>{{ !empty($datos['venc_hidro']) ? \Carbon\Carbon::parse($datos['venc_hidro'])->format('d/m/Y') : '' }}</td></tr>
        <tr><td class="bold bg-light">Vencimiento de Recarga/Mantenimiento:</td><td>{{ !empty($datos['venc_recarga']) ? \Carbon\Carbon::parse($datos['venc_recarga'])->format('d/m/Y') : '' }}</td></tr>
    </table>

    <!-- IMAGEN EXTINTOR -->
    <div style="width: 48%; float: right; text-align: center; margin-top: 10px;">
        @php
            $imagePath = public_path('images/extintor.png');
            if (file_exists($imagePath)) {
                $type = pathinfo($imagePath, PATHINFO_EXTENSION);
                $data = file_get_contents($imagePath);
                $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
            } else {
                $base64 = null;
            }
        @endphp

        @if($base64)
            <img src="{{ $base64 }}" style="max-height: 140px; max-width: 100%;" />
        @else
            <div style="border: 1px solid #000; height: 135px; display: table; width: 100%;">
                <div style="display: table-cell; vertical-align: middle; color: #777;">
                    <i>(Falta la imagen: guarda tu archivo como backend/public/images/extintor.png)</i>
                </div>
            </div>
        @endif
    </div>
    <div style="clear: both;"></div>

    <br>

    @php
        $criterios = [
            '1. El manómetro indica cargado (zona verde).',
            '2. Acceso libre de obstáculos.',
            '3. Buena Ubicación.',
            '4. Zona y/o extintor numerado.',
            '5. Pictograma de clase de fuego legible',
            '6. Pictograma de clase de forma de uso legible.',
            '7. Etiqueta de carga legible.',
            '8. Indica tipo de carga de agente extintor.',
            '9. Posee colgador para pared.',
            '10. Posee pasador y precinto de seguridad sellado.',
            '11. Manija de acarreo y/o palanca de activación en buen estado.',
            '12. Manguera en buen estado.',
            '13. La tobera, pitón o pistola esta en óptimas condiciones.',
            '14. Abrazadera o sujetador de manguera en buen estado.',
            '15. Cilindro / Botella / Cartucho impulsor en buen estado.',
            '16. Pintura de botella y cartucho impulsor esta en buen estado.',
            '17. Otros'
        ];
    @endphp

    <!-- TABLA DE EVALUACIÓN -->
    <table class="eval-table">
        <tr>
            <th width="70%" rowspan="2" style="font-size: 11px;">DESCRIPCIÓN</th>
            <th width="30%" colspan="2" style="font-size: 11px;">FECHA DE INSPECCIÓN</th>
        </tr>
        <tr>
            <th width="15%" class="center" style="background-color: #85c1e9; color: #000;">SI</th>
            <th width="15%" class="center" style="background-color: #85c1e9; color: #000;">NO</th>
        </tr>
        @foreach($criterios as $index => $criterio)
            @php $val = $datos['c'.($index+1)] ?? ''; @endphp
            <tr>
                <td>{{ $criterio }}</td>
                <td class="center">{{ $val === 'SI' ? 'X' : '' }}</td>
                <td class="center">{{ $val === 'NO' ? 'X' : '' }}</td>
            </tr>
        @endforeach
    </table>

    <!-- OBSERVACIONES -->
    <div style="margin-top: 10px;">
        <div class="bold" style="margin-bottom: 5px;">OBSERVACIONES:</div>
        <div style="border-bottom: 1px dashed #000; min-height: 15px; margin-bottom: 5px;">{{ $datos['observaciones'] ?? '' }}</div>
        <div style="border-bottom: 1px dashed #000; min-height: 15px;"></div>
    </div>

    <!-- FIRMAS -->
    <table class="signature-table" style="margin-top: 30px;">
        <tr style="background-color: #5ab4e5; color: white; font-weight: bold;">
            <td style="height: 20px; padding: 4px;">Nombre y Firma Inspector</td>
            <td style="height: 20px; padding: 4px;">Nombre y Firma Capataz/Jefe de Grupo</td>
            <td style="height: 20px; padding: 4px;">Nombre y Firma Prevencionista de Riesgo</td>
        </tr>
        <tr>
            <td>
                @if(!empty($datos['firma_inspector']))
                    <img src="{{ $datos['firma_inspector'] }}" style="max-height: 50px;"/><br>
                @endif
                {{ $datos['nombre_inspector'] ?? '_____________________' }}
            </td>
            <td>
                @if(!empty($datos['firma_capataz']))
                    <img src="{{ $datos['firma_capataz'] }}" style="max-height: 50px;"/><br>
                @endif
                {{ $datos['nombre_capataz'] ?? '_____________________' }}
            </td>
            <td>
                @php
                    $firmaPrev = $respuesta->aprobaciones->first(function($a) { return $a->rolFirma && strtolower($a->rolFirma->rol) === 'prevencionista'; });
                @endphp
                @if($firmaPrev && $firmaPrev->estado === 'firmado' && $firmaPrev->firma_base64)
                    <img src="{{ $firmaPrev->firma_base64 }}" style="max-height: 50px;"/><br>
                @endif
                {{ $firmaPrev && $firmaPrev->usuario ? $firmaPrev->usuario->name : '_____________________' }}
            </td>
        </tr>
    </table>

</body>
</html>
