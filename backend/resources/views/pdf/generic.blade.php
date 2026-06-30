<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $respuesta->formulario->codigo }}</title>
    <style>
        @page {
            margin: 1cm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #000;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }
        th, td {
            border: 1px solid #000;
            padding: 4px;
            vertical-align: middle;
        }
        .header-title {
            text-align: center;
            font-weight: bold;
        }
        .section-header {
            background-color: #5ab4e5;
            color: white;
            font-weight: bold;
            text-align: center;
            font-size: 11px;
        }
        .logo {
            text-align: center;
            font-weight: bold;
            color: #000;
            font-size: 14px;
        }
        .logo span { color: #5b2c6f; }
        .logo span.it { color: #e67e22; }
        .checkbox {
            display: inline-block;
            width: 10px;
            height: 10px;
            border: 1px solid #000;
            margin-right: 3px;
        }
        .checkbox.checked {
            background-color: #000;
        }
        .signature-img {
            max-width: 80px;
            max-height: 30px;
            display: block;
            margin: 0 auto;
        }
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
            <td width="60%" class="header-title" rowspan="2" style="font-size: 12px;">
                FORMATO<br>
                {{ mb_strtoupper($respuesta->formulario->nombre) }}
            </td>
            <td width="20%" style="font-size: 9px;">CODIGO: {{ $respuesta->formulario->codigo }}</td>
        </tr>
        <tr>
            <td style="font-size: 9px;">Estado: Vigente &nbsp;&nbsp; Versión: 01</td>
        </tr>
        <tr>
            <td class="header-title" style="font-size: 11px;">Proceso: SST</td>
            <td style="font-size: 9px;">Publicación:<br>{{ \Carbon\Carbon::parse($respuesta->formulario->created_at)->format('d/m/Y') }} &nbsp; Página 1 de 1</td>
        </tr>
    </table>

    <!-- DATOS DEL EMPLEADOR -->
    <table>
        <tr><td colspan="2" class="section-header">DATOS DEL EMPLEADOR</td></tr>
        <tr>
            <td width="60%">RAZON SOCIAL: {{ $respuesta->proyecto->razon_social ?? 'TACTICAL IT' }}</td>
            <td width="40%">RUC: {{ $respuesta->proyecto->ruc ?? '20545318561' }}</td>
        </tr>
        <tr>
            <td colspan="2">ACTIVIDAD ECONÓMICA: {{ $respuesta->proyecto->actividad_economica ?? 'Actividades de arquitectura e ingeniería y comunicaciones' }}</td>
        </tr>
        <tr>
            <td>LUGAR: {{ $datos['lugar_empleador'] ?? 'LIMA' }}</td>
            <td>N° DE TRABAJADORES: {{ $datos['num_trabajadores'] ?? '' }}</td>
        </tr>
    </table>

    <!-- DATOS GENERALES -->
    <table>
        <tr><td colspan="2" class="section-header">DATOS GENERALES</td></tr>
        <tr>
            <td colspan="2">PROYECTO: {{ $respuesta->proyecto->nombre ?? '' }}</td>
        </tr>
        <tr>
            <td width="50%">FECHA: {{ \Carbon\Carbon::parse($respuesta->fecha)->format('d/m/Y') }}</td>
            <td width="50%">LUGAR: {{ $datos['lugar_capacitacion'] ?? $respuesta->proyecto->ubicacion ?? '' }}</td>
        </tr>
        <tr>
            <td colspan="2" style="height: 30px; vertical-align: top;">
                NOMBRE DEL (LOS) CAPACITADOR(ES) O ENTRENADOR(ES):<br>
                {{ $datos['capacitadores'] ?? '' }}
            </td>
        </tr>
    </table>

    <!-- TIPO -->
    <table>
        <tr><td colspan="6" class="section-header">TIPO</td></tr>
        <tr>
            @php $tipo = $datos['tipo_actividad'] ?? ''; @endphp
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipo, 'Inducción') ? 'checked' : '' }}"></div> INDUCCION</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipo, 'Capacitación') ? 'checked' : '' }}"></div> CAPACITACIÓN</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipo, 'Entrenamiento') ? 'checked' : '' }}"></div> ENTRENAMIENTO</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipo, 'Charla 5 minutos') ? 'checked' : '' }}"></div> CHARLA 5 MINUTOS</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipo, 'Simulacro de Emergencia') ? 'checked' : '' }}"></div> SIMULACRO DE EMERGENCIA</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipo, 'Otros') ? 'checked' : '' }}"></div> OTROS</td>
        </tr>
        <tr>
            <td colspan="2">HORA DE INICIO: {{ $datos['hora_inicio'] ?? '' }}</td>
            <td colspan="2">HORA DE TERMINO: {{ $datos['hora_termino'] ?? '' }}</td>
            <td>N° DE HORAS: {{ $datos['num_horas'] ?? '' }}</td>
            <td>N° DE PARTICIPANTES: {{ $datos['num_participantes'] ?? '' }}</td>
        </tr>
    </table>

    <!-- TEMAS ESPECIFICOS / DETALLES -->
    <table>
        <tr><td class="section-header" style="background-color: #ddd; color: #000; text-align: left;">TEMAS ESPECIFICOS Y DETALLES DEL REGISTRO:</td></tr>
        @if(count($datos) > 0)
            @php $i = 1; @endphp
            @foreach($datos as $key => $value)
                @if(!in_array($key, ['razon_social', 'ruc', 'actividad_economica', 'lugar_empleador', 'num_trabajadores', 'lugar_capacitacion', 'capacitadores', 'tipo_actividad', 'hora_inicio', 'hora_termino', 'num_horas', 'num_participantes']))
                    <tr><td style="height: 20px;">{{ $i }}.- <strong>{{ str_replace('_', ' ', mb_strtoupper($key)) }}:</strong> {{ $value }}</td></tr>
                    @php $i++; @endphp
                @endif
            @endforeach
        @else
            <tr><td style="height: 20px;">1.- </td></tr>
            <tr><td style="height: 20px;">2.- </td></tr>
            <tr><td style="height: 20px;">3.- </td></tr>
        @endif
    </table>

    <!-- ASISTENTES -->
    @if($respuesta->participantes && count($respuesta->participantes) > 0)
    <table>
        <tr><td colspan="6" class="section-header">ASISTENTES</td></tr>
        <tr style="background-color: #eee; text-align: center;">
            <th width="3%">N°</th>
            <th width="32%">APELLIDOS Y NOMBRES</th>
            <th width="20%">CARGO/AREA</th>
            <th width="10%">DNI</th>
            <th width="15%">EMPRESA</th>
            <th width="20%">FIRMA</th>
        </tr>
        @foreach($respuesta->participantes as $index => $p)
        <tr>
            <td style="text-align: center;">{{ $index + 1 }}</td>
            <td>{{ $p->nombre }}</td>
            <td>{{ $p->cargo }}</td>
            <td style="text-align: center;">{{ $p->dni }}</td>
            <td>{{ $p->empresa ?? 'TACTICAL IT' }}</td>
            <td style="text-align: center; height: 35px; padding: 2px;">
                @if($p->firma)
                    <img src="{{ $p->firma }}" class="signature-img">
                @endif
            </td>
        </tr>
        @endforeach
    </table>
    @endif

</body>
</html>
