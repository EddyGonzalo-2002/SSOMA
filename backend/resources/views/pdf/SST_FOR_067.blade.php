<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>SST-FOR-067</title>
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
                REGISTRO PARA ACTIVIDADES DE SEGURIDAD Y SALUD EN EL TRABAJO
            </td>
            <td width="20%" style="font-size: 9px;">CODIGO: SST-FOR-067</td>
        </tr>
        <tr>
            <td style="font-size: 9px;">Estado: Vigente &nbsp;&nbsp; Versión: 01</td>
        </tr>
        <tr>
            <td class="header-title" style="font-size: 11px;">Proceso: SST</td>
            <td style="font-size: 9px;">Publicación:<br>28/02/2025 &nbsp; Página 1 de 1</td>
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
            @php 
                $tipoRaw = $datos['tipo_actividad'] ?? ''; 
                $tipoStr = is_array($tipoRaw) ? implode(',', $tipoRaw) : $tipoRaw;
            @endphp
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipoStr, 'Inducción') ? 'checked' : '' }}"></div> INDUCCION</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipoStr, 'Capacitación') ? 'checked' : '' }}"></div> CAPACITACIÓN</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipoStr, 'Entrenamiento') ? 'checked' : '' }}"></div> ENTRENAMIENTO</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipoStr, 'Charla 5 minutos') ? 'checked' : '' }}"></div> CHARLA 5 MINUTOS</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipoStr, 'Simulacro de Emergencia') ? 'checked' : '' }}"></div> SIMULACRO DE EMERGENCIA</td>
            <td style="text-align: center;"><div class="checkbox {{ str_contains($tipoStr, 'Otros') ? 'checked' : '' }}"></div> OTROS</td>
        </tr>
        <tr>
            <td colspan="2">HORA DE INICIO: {{ $datos['hora_inicio'] ?? '' }}</td>
            <td colspan="2">HORA DE TERMINO: {{ $datos['hora_termino'] ?? '' }}</td>
            <td>N° DE HORAS: {{ $datos['num_horas'] ?? '' }}</td>
            <td>N° DE PARTICIPANTES: {{ $datos['num_participantes'] ?? '' }}</td>
        </tr>
    </table>

    <!-- TEMAS ESPECIFICOS -->
    <table>
        <tr><td class="section-header" style="background-color: #ddd; color: #000; text-align: left;">TEMAS ESPECIFICOS:</td></tr>
        @php
            $temas = array_filter([
                $datos['tema_1'] ?? null,
                $datos['tema_2'] ?? null,
                $datos['tema_3'] ?? null,
            ]);
        @endphp
        @forelse($temas as $tema)
            <tr><td style="height: 20px;">{{ $loop->iteration }}.- {{ $tema }}</td></tr>
        @empty
            <tr><td style="height: 20px;">1.- </td></tr>
        @endforelse
    </table>

    <!-- ASISTENTES -->
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

</body>
</html>
