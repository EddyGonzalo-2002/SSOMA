<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>SST-FOR-034 - ATS</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 8px;
            margin: 0;
            padding: 0;
            color: #000;
        }
        @page {
            margin: 10mm;
        }
        .table-wrapper {
            font-size: 0;
            line-height: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            margin-bottom: -1px;
            padding: 0;
            font-size: 8px;
            line-height: 1.2;
        }
        th, td {
            border: 1px solid #000;
            padding: 2px 4px;
            vertical-align: middle;
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .bg-blue { background-color: #4bd3e6; font-weight: bold; text-align: center; }
        .bg-light { background-color: #f2f2f2; }
        
        .header-logo {
            width: 120px;
        }
        .logo {
            text-align: center;
            font-weight: bold;
            color: #000;
            font-size: 14px;
        }
        .logo span { color: #5b2c6f; }
        .logo span.it { color: #e67e22; }
        .header-title {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
        }
        .header-meta {
            font-size: 7px;
        }
        .section-title {
            background-color: #4bd3e6;
            font-weight: bold;
            text-align: center;
            font-size: 9px;
            padding: 3px;
        }
        
        .checkbox-container {
            display: inline-block;
            margin-right: 10px;
        }
        .checkbox {
            display: inline-block;
            width: 8px;
            height: 8px;
            border: 1px solid #000;
            margin-right: 3px;
            vertical-align: middle;
        }
        .checkbox.checked {
            background-color: #000;
        }
        
        /* Two columns for questions */
        .q-table {
            width: 100%;
            table-layout: fixed;
        }
        .q-table td {
            width: 50%;
            vertical-align: top;
            padding: 4px;
        }
        
        /* ATS Table */
        .ats-table th {
            background-color: #fff;
            text-align: center;
            font-size: 7px;
            font-weight: bold;
        }
        .ats-table td {
            height: 25px; /* Fixed height for rows */
            vertical-align: top;
        }

        /* Signatures */
        .signature-box {
            text-align: center;
            height: 60px;
            vertical-align: bottom;
            padding-bottom: 5px;
        }
        .signature-img {
            max-width: 100px;
            max-height: 40px;
        }

        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>

    @php
        $datos = is_string($respuesta->datos) ? json_decode($respuesta->datos, true) : $respuesta->datos;
        $evaluaciones = [
            '1.- ¿El RIESGO más crítico de la actividad fue identificado (Carga suspendida, trabajo en altura, etc.)?',
            '2.- ¿Evaluó las condiciones del entorno de trabajo (Ej: Niveles de ruido, Espacio disponible, Iluminación, Temperatura, Sup. de trabajo, Desniveles, Polvo, Etc.)?',
            '3.- ¿Identificó los Aspectos Ambientales: derrames de aceite o hidrocarburos, Sustancias Peligrosas, contaminación del aire, generación de residuos y descargas a cursos de agua?',
            '4.- ¿Se identificó el EPP adecuado para la tarea: Casco, Zapatos de seguridad, lentes de seguridad, Guantes, Protectores Auditivos, Arnés de Seguridad, Respirador, ¿Se encuentra en buen estado?',
            '5.- ¿El personal está capacitado para realizar la actividad?',
            '6.- ¿Se coordinó adecuadamente INTERFERENCIAS o interfases con otras actividades y/o operaciones?',
            '7.- ¿Las herramientas, equipos e instalaciones eléctricas, están en condiciones de ser usadas según estándares establecidos y según la codificación de color del mes?',
            '8.- ¿Evaluó la aplicación de bloqueos físicos requeridos para energías peligrosas?',
            '9.- ¿Evaluó el riesgo de incendio y vías de escape disponibles? ¿El área de trabajo se encuentra limpia y ordenada?',
            '10.- ¿Para trabajos en altura evaluó: escalas, escaleras, accesos, líneas de vida, plataformas, andamios, atrapa soga, soga o cordel de perlón?',
            '11.- ¿Los andamios se encuentran aprobados con tarjeta de color verde visible, si se están armando, éstos cuentan con tarjeta roja?',
            '12.- ¿Para trabajos en caliente se cuenta con equipo de extinción de incendio? ¿El equipo de extinción se encuentra en buenas condiciones? ¿Existen Biombos?'
        ];
        
    @endphp

    <!-- HEADER -->
    <div class="table-wrapper">
    <table style="table-layout: fixed;">
        <tr>
            <td rowspan="4" width="20%" class="logo">
                <div style="font-size: 16px;"><span>tactical</span><span class="it"> it</span></div>
                <div style="font-size: 6px; font-weight: normal; color: #777;">TECNOLOGÍA QUE TRANSFORMA</div>
            </td>
            <td colspan="2" class="header-title">FORMATO</td>
            <td colspan="2" class="header-meta">Código: SST-FOR-034</td>
        </tr>
        <tr>
            <td colspan="2" class="header-title">ANALISIS DE TRABAJO SEGURO (ATS)</td>
            <td class="header-meta">Estado: Vigente</td>
            <td class="header-meta">Versión: 01</td>
        </tr>
        <tr>
            <td width="15%" rowspan="2" class="text-center font-bold">Proceso:</td>
            <td width="25%" rowspan="2" class="text-center font-bold">SST</td>
            <td width="20%" class="header-meta">Publicación: 28/02/2025</td>
            <td width="20%" class="header-meta">Página 1 de 2</td>
        </tr>
        <tr>
            <td colspan="2" class="header-meta">Elaborado por: AREA SSOMA</td>
        </tr>
    </table>
    </div>

    <!-- INFO BLOCK -->
    <div class="table-wrapper">
    <table style="table-layout: fixed;">
        <tr>
            <td width="30%" class="text-center font-bold">OBRA</td>
            <td width="40%" colspan="2" class="text-center font-bold">EMPRESA</td>
            <td width="30%" colspan="2" class="text-center font-bold">CAPATAZ / RESPONSABLE DE OBRA</td>
        </tr>
        <tr>
            <td class="text-center" style="height:30px;">{{ $respuesta->proyecto->nombre ?? '' }}</td>
            <td colspan="2" class="text-center font-bold">TACTICAL IT</td>
            <td colspan="2" class="text-center" style="position: relative;">
                {{ $respuesta->usuario->name ?? '' }}
                <div style="position: absolute; bottom: 2px; right: 2px; font-size: 7px; font-weight: bold;">HORA</div>
            </td>
        </tr>
        <tr>
            <td width="30%" class="text-center font-bold">TRABAJO O ACTIVIDAD</td>
            <td width="20%" class="text-center font-bold">SECTOR DE TRABAJO</td>
            <td width="20%" class="text-center font-bold">ESPECIALIDAD</td>
            <td width="15%" class="text-center font-bold">FECHA</td>
            <td width="15%" class="text-center font-bold">INICIO {{ $datos['hora_inicio'] ?? '' }}</td>
        </tr>
        <tr>
            <td class="text-center" style="height:20px;">{{ $respuesta->actividad->nombre ?? '' }}</td>
            <td class="text-center">{{ $respuesta->area->nombre ?? '' }}</td>
            <td class="text-center">{{ $datos['especialidad'] ?? '' }}</td>
            <td class="text-center">{{ \Carbon\Carbon::parse($respuesta->created_at)->format('d/m/Y') }}</td>
            <td class="text-center font-bold">FINAL {{ $datos['hora_final'] ?? '' }}</td>
        </tr>
    </table>
    </div>

    <!-- EVALUACION -->
    <div class="table-wrapper">
    <table width="100%">
        <tr>
            <td class="section-title" colspan="4">*MARCAR SI, NO, N/A (no aplica), SEGÚN CORRESPONDA.</td>
        </tr>
        @for($i=1; $i<=6; $i++)
            @php 
                $val1 = $datos['eval_'.$i] ?? ''; 
                $val2 = $datos['eval_'.($i+6)] ?? ''; 
            @endphp
            <tr>
                <td width="45%" style="padding: 4px; vertical-align: top;">{{ $evaluaciones[$i-1] }}</td>
                <td width="5%" class="text-center font-bold" style="vertical-align: middle;">{{ $val1 }}</td>
                <td width="45%" style="padding: 4px; vertical-align: top;">{{ $evaluaciones[$i+5] }}</td>
                <td width="5%" class="text-center font-bold" style="vertical-align: middle;">{{ $val2 }}</td>
            </tr>
        @endfor
    </table>
    </div>

    <!-- PERMISOS -->
    <div class="table-wrapper">
    <table width="100%">
        <tr>
            <td class="section-title" colspan="12">PROCEDIMIENTOS ESPECIALES Y PERMISOS REQUERIDOS</td>
        </tr>
        <tr style="font-size: 6px; text-align: center; font-weight: bold; vertical-align: middle;">
            @php 
                $permisosRaw = $datos['permisos_requeridos'] ?? ''; 
                $permisos = is_array($permisosRaw) ? $permisosRaw : explode(',', $permisosRaw);
            @endphp
            <td width="14%">PERMISO DE TRABAJO</td>
            <td width="2.6%">{{ in_array('Permiso de Trabajo', $permisos) ? 'X' : '' }}</td>
            <td width="14%">PROCEDIMIENTO ESPECIFICO</td>
            <td width="2.6%">{{ in_array('Procedimiento Especifico', $permisos) ? 'X' : '' }}</td>
            <td width="14%">CAPACITACION ESPECIFICA</td>
            <td width="2.6%">{{ in_array('Capacitacion Especifica', $permisos) ? 'X' : '' }}</td>
            <td width="14%">HOJAS DE SDS</td>
            <td width="2.6%">{{ in_array('Hojas de SDS', $permisos) ? 'X' : '' }}</td>
            <td width="14%">EQUIPO DE PROTECCION COLECTIVA</td>
            <td width="2.6%">{{ in_array('Equipo de Proteccion Colectiva', $permisos) ? 'X' : '' }}</td>
            <td width="14%">OTROS</td>
            <td width="2.6%">{{ in_array('Otros', $permisos) ? 'X' : '' }}</td>
        </tr>
    </table>
    </div>

    <!-- CONSIDERACIONES -->
    <table>
        <tr>
            <td width="60%" class="font-bold">Cumpliré TODAS las directivas que me imparte la EMPRESA para evitar accidentarme; NO ejecutare trabajo alguno de no cumplir con estas disposiciones</td>
            <td width="40%" class="font-bold">Cumplir con el Reglamento Interno de Seguridad y Salud en el Trabajo</td>
        </tr>
        <tr>
            <td>Elaborar mi ATS antes de iniciar las labores.</td>
            <td>De incorporarse personal nuevo a la cuadrilla, el jefe de grupo y/o capataz deberá comunicar a este nuevo personal los riesgos asociados</td>
        </tr>
        <tr>
            <td>Elaborar mi PETAR (Permiso Especifico de Trabajo de Alto Riesgo) de ser necesario.</td>
            <td>No retirar y/o eliminar sistemas de protección, dispositivos y/o medidas de protección o de seguridad</td>
        </tr>
        <tr>
            <td>Contar con todo el EPP requerido.</td>
            <td>Todo personal debe contar con su induccion en seguridad en obra, antes de inicial sus labores.</td>
        </tr>
        <tr>
            <td>Si no tengo experiencia, no he sido instruido y/o entrenado en dicho trabajo.</td>
            <td>Se debe entregar los epps a todo trabajador antes de iniciar sus labores.</td>
        </tr>
        <tr>
            <td>Si el trabajo a realizar es de alto riesgo y no tengo los permisos requeridos.</td>
            <td>Se debe contar con personal especializado en seguridad y salud en el trabajo.</td>
        </tr>
        <tr>
            <td>Haré uso adecuado en todo momento de mi EPP, no los alteraré o reemplazaré.</td>
            <td class="font-bold">Ninguna labor podrá realizarse sin el formato de ATS</td>
        </tr>
        <tr>
            <td>En caso de accidente, debo PARALIZAR mi trabajo y REPORTAR inmediato el hecho a mi supervisor inmediato.</td>
            <td></td>
        </tr>
        <tr>
            <td colspan="2" style="padding: 0; border: none;">
                <table style="margin: 0; width: 100%; border-collapse: collapse;">
                    <tr>
                        <td colspan="6" class="section-title" style="border-bottom: 1px solid #000;">SE COMPROMETIO A CUMPLIR CON LAS OBLIGACIONES Y LAS CONSIDERACIONES ESTABLECIDAS</td>
                    </tr>
                    <tr>
                        <td width="40%" style="border: none;">&nbsp;</td>
                        <td width="5%" class="text-center font-bold" style="border-top: none; border-bottom: none; border-left: 1px solid #000;">SI</td>
                        <td width="5%" style="border-top: none; border-bottom: none;"></td>
                        <td width="5%" class="text-center font-bold" style="border-top: none; border-bottom: none;">NO</td>
                        <td width="5%" style="border-top: none; border-bottom: none; border-right: 1px solid #000;"></td>
                        <td width="40%" style="border: none;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- ATS TABLE (Page 1 fits ~5 rows, rest on Page 2) -->
    <table class="ats-table">
        <tr>
            <td colspan="4" class="section-title" style="font-size: 11px;">ANALISIS DE TRABAJO SEGURO (ATS)</td>
        </tr>
        <tr>
            <th width="20%">SECUENCIA DE LA TAREA</th>
            <th width="25%">PELIGROS (FUENTE O SITUACIÓN DE POSIBLE DAÑO)</th>
            <th width="25%">RIESGOS / CONSECUENCIAS (QUE PUEDE PASAR)</th>
            <th width="30%">MEDIDAS DE CONTROL<br>(QUE DEBEMOS HACER PARA MINIMIZAR EL RIESGO)</th>
        </tr>
        @for($i=1; $i<=11; $i++)
            <tr>
                <td>{{ $datos["ats_seq_$i"] ?? '' }}</td>
                <td>{{ $datos["ats_pel_$i"] ?? '' }}</td>
                <td>{{ $datos["ats_rie_$i"] ?? '' }}</td>
                <td>{{ $datos["ats_ctrl_$i"] ?? '' }}</td>
            </tr>
        @endfor
    </table>
    </div>

    <div class="page-break"></div>

    <!-- HEADER PAGE 2 -->
    <div class="table-wrapper">
    <table style="table-layout: fixed;">
        <tr>
            <td rowspan="4" width="20%" class="logo">
                <div style="font-size: 16px;"><span>tactical</span><span class="it"> it</span></div>
                <div style="font-size: 6px; font-weight: normal; color: #777;">TECNOLOGÍA QUE TRANSFORMA</div>
            </td>
            <td colspan="2" class="header-title">FORMATO</td>
            <td colspan="2" class="header-meta">Código: SST-FOR-034</td>
        </tr>
        <tr>
            <td colspan="2" class="header-title">ANALISIS DE TRABAJO SEGURO (ATS)</td>
            <td class="header-meta">Estado: Vigente</td>
            <td class="header-meta">Versión: 01</td>
        </tr>
        <tr>
            <td width="15%" rowspan="2" class="text-center font-bold">Proceso:</td>
            <td width="25%" rowspan="2" class="text-center font-bold">SST</td>
            <td width="20%" class="header-meta">Publicación: 28/02/2025</td>
            <td width="20%" class="header-meta">Página 2 de 2</td>
        </tr>
        <tr>
            <td colspan="2" class="header-meta">Elaborado por: AREA SSOMA</td>
        </tr>
    </table>

    <!-- ATS TABLE CONTINUATION (8 rows) -->
    <table class="ats-table">
        <tr>
            <th width="20%">SECUENCIA DE LA TAREA (Cont.)</th>
            <th width="25%">PELIGROS (Cont.)</th>
            <th width="25%">RIESGOS / CONSECUENCIAS (Cont.)</th>
            <th width="30%">MEDIDAS DE CONTROL (Cont.)</th>
        </tr>
        @for($i=12; $i<=14; $i++)
            <tr>
                <td>{{ $datos["ats_seq_$i"] ?? '' }}</td>
                <td>{{ $datos["ats_pel_$i"] ?? '' }}</td>
                <td>{{ $datos["ats_rie_$i"] ?? '' }}</td>
                <td>{{ $datos["ats_ctrl_$i"] ?? '' }}</td>
            </tr>
        @endfor
    </table>

    <!-- ASISTENTES -->
    <table>
        <tr>
            <td colspan="8" class="section-title">PERSONAL PARTICIPANTE DEL TRABAJO</td>
        </tr>
        <tr class="text-center font-bold bg-light">
            <td width="3%">N°</td>
            <td width="22%">NOMBRES Y APELLIDOS</td>
            <td width="10%">DNI</td>
            <td width="15%">FIRMA</td>
            <td width="3%">N°</td>
            <td width="22%">NOMBRES Y APELLIDOS</td>
            <td width="10%">DNI</td>
            <td width="15%">FIRMA</td>
        </tr>
        @php
            // We have 14 slots for participants. The first 7 on the left, next 7 on the right.
            $participantes = $respuesta->participantes ?? [];
        @endphp
        @for($i=0; $i<7; $i++)
            @php 
                $p1 = $participantes[$i] ?? null; 
                $p2 = $participantes[$i+7] ?? null; 
            @endphp
            <tr>
                <td class="text-center">{{ $i+1 }}</td>
                <td>{{ $p1->nombre ?? '' }}</td>
                <td class="text-center">{{ $p1->dni ?? '' }}</td>
                <td class="text-center">
                    @if(isset($p1->firma_base64))
                        <img src="{{ $p1->firma_base64 }}" style="max-width:50px; max-height:20px;">
                    @endif
                </td>
                
                <td class="text-center">{{ $i+8 }}</td>
                <td>{{ $p2->nombre ?? '' }}</td>
                <td class="text-center">{{ $p2->dni ?? '' }}</td>
                <td class="text-center">
                    @if(isset($p2->firma_base64))
                        <img src="{{ $p2->firma_base64 }}" style="max-width:50px; max-height:20px;">
                    @endif
                </td>
            </tr>
        @endfor
    </table>

    <!-- FIRMAS LÍDERES (Split across 2 columns + 1 spanning below) -->
    @php
        // Map firmantes by rol
        $firmasByRol = [];
        if($respuesta->aprobaciones) {
            foreach($respuesta->aprobaciones as $aprobacion) {
                if($aprobacion->estado === 'firmado') {
                    $firmasByRol[$aprobacion->rolFirma->rol] = $aprobacion;
                }
            }
        }
    @endphp
    <table>
        <tr>
            <td class="section-title" width="33%">FIRMA DEL JEFE GRUPO O CAPATAZ</td>
            <td class="section-title" width="33%">FIRMA DEL ING. JEFE CAMPO Y/O RESIDENTE DE OBRA</td>
            <td class="section-title" width="33%">FIRMA DEL JEFE Y/O SUPERVISOR SSOMA</td>
        </tr>
        <tr>
            <td class="signature-box">
                @if(isset($firmasByRol['jefe_grupo_capataz']))
                    <img src="{{ $firmasByRol['jefe_grupo_capataz']->firma_base64 }}" class="signature-img"><br>
                    {{ $firmasByRol['jefe_grupo_capataz']->user->name }}<br>
                    {{ \Carbon\Carbon::parse($firmasByRol['jefe_grupo_capataz']->updated_at)->format('d/m/Y H:i') }}
                @endif
            </td>
            <td class="signature-box">
                @if(isset($firmasByRol['ing_residente']))
                    <img src="{{ $firmasByRol['ing_residente']->firma_base64 }}" class="signature-img"><br>
                    {{ $firmasByRol['ing_residente']->user->name }}<br>
                    {{ \Carbon\Carbon::parse($firmasByRol['ing_residente']->updated_at)->format('d/m/Y H:i') }}
                @endif
            </td>
            <td class="signature-box">
                @if(isset($firmasByRol['supervisor_ssoma']))
                    <img src="{{ $firmasByRol['supervisor_ssoma']->firma_base64 }}" class="signature-img"><br>
                    {{ $firmasByRol['supervisor_ssoma']->user->name }}<br>
                    {{ \Carbon\Carbon::parse($firmasByRol['supervisor_ssoma']->updated_at)->format('d/m/Y H:i') }}
                @endif
            </td>
        </tr>
    </table>
    <table style="font-size: 6px;">
        <tr>
            <td class="font-bold">* Todo trabajo debe poseer un análisis de riesgo antes de iniciar la tarea.</td>
        </tr>
        <tr>
            <td>
                * El ATS de terreno es una herramienta destinada a controlar los riesgos en el punto de trabajo paso a paso del trabajador, dado que las condiciones cambian permanentemente, permite identificar las diferencias que pueden existir con respecto a procedimientos u otros documentos generados con anterioridad a la actividad. <br>
                * La calidad del ATS será estandarizada por los trabajadores en el mismo formulario y revisado en terreno por el SUPERVISOR. <br>
                * Todo trabajo debe poseer un análisis de riesgo antes de iniciar la tarea.
            </td>
        </tr>
    </table>
    </div>

</body>
</html>
