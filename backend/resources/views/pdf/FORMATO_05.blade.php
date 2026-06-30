<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>FORMATO-05</title>
    <style>
        @page { margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 10px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        th, td { border: 1px solid #000; padding: 4px; vertical-align: middle; }
        .header-title { text-align: center; font-weight: bold; }
        .section-header { background-color: #0d47a1; color: white; font-weight: bold; text-align: center; font-size: 11px; }
        .logo { text-align: center; font-weight: bold; color: #000; font-size: 14px; }
        .logo span { color: #5b2c6f; }
        .logo span.it { color: #e67e22; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .bg-light { background-color: #f2f2f2; }
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
                CHECK LIST DE INSPECCIÓN DE ORDEN Y LIMPIEZA
            </td>
            <td width="20%" style="font-size: 9px;">Código: FORMATO 05</td>
        </tr>
        <tr>
            <td style="font-size: 9px;">Versión: 01</td>
        </tr>
        <tr>
            <td class="header-title" style="font-size: 11px;">Tipo de documento: Formato</td>
            <td style="font-size: 9px;">Página: 1 de 1</td>
        </tr>
    </table>

    <!-- INFO -->
    <table>
        <tr class="section-header">
            <td colspan="2">AREA: {{ mb_strtoupper($datos['area_evaluar'] ?? 'SEGURIDAD, SALUD OCUPACIONAL Y MEDIO AMBIENTE') }}</td>
        </tr>
        <tr>
            <td width="50%" class="bg-light bold">Inspector: <span style="font-weight: normal;">{{ mb_strtoupper($datos['inspector'] ?? $respuesta->usuario->name) }}</span></td>
            <td width="50%" class="bg-light bold">Fecha: <span style="font-weight: normal;">{{ \Carbon\Carbon::parse($respuesta->fecha)->format('d/m/Y') }}</span></td>
        </tr>
    </table>

    <!-- INSTRUCCIONES -->
    <table style="font-size: 9px;">
        <tr>
            <td width="50%" class="center bold bg-light">Instrucciones</td>
            <td width="50%" class="center bold bg-light">Criterios de evaluación</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">
                Observar cuidadosamente el área a evaluar<br>
                Entrevistar al personal durante la evaluación<br>
                Retroalimentar al personal del área sobre los resultados (positivos y negativos)<br>
                Completar evaluación y dejar copia en el área
            </td>
            <td style="vertical-align: top;">
                <b>No Aplica:</b> Si el requisito no se puede verificar en el área observada. Colocar NA el numero 1<br>
                <b>No Cumple:</b> Si el área observada no cumple con el requisito. Colocar en la columna NC el numero 1<br>
                <b>Cumple Parcialmente:</b> Si el área observada cumple con algunos de los requisitos evaluados. Colocar en la columna CP el numero 1<br>
                <b>Cumple en su Totalidad:</b> Si el área observada cumple en su totalidad con el requisito evaluado. Colocar en la columna CT el numero 1
            </td>
        </tr>
    </table>

    @php
        function getVal($val) {
            if ($val == 'NA') return ['NA'=>1, 'NC'=>'', 'CP'=>'', 'CT'=>''];
            if ($val == 'NC') return ['NA'=>'', 'NC'=>1, 'CP'=>'', 'CT'=>''];
            if ($val == 'CP') return ['NA'=>'', 'NC'=>'', 'CP'=>1, 'CT'=>''];
            if ($val == 'CT') return ['NA'=>'', 'NC'=>'', 'CP'=>'', 'CT'=>1];
            return ['NA'=>'', 'NC'=>'', 'CP'=>'', 'CT'=>''];
        }

        $org1 = getVal($datos['org_1'] ?? '');
        $org2 = getVal($datos['org_2'] ?? '');
        $org3 = getVal($datos['org_3'] ?? '');
        $org4 = getVal($datos['org_4'] ?? '');

        $ord1 = getVal($datos['ord_1'] ?? '');
        $ord2 = getVal($datos['ord_2'] ?? '');
        $ord3 = getVal($datos['ord_3'] ?? '');
        $ord4 = getVal($datos['ord_4'] ?? '');
        $ord5 = getVal($datos['ord_5'] ?? '');

        $lim1 = getVal($datos['lim_1'] ?? '');
        $lim2 = getVal($datos['lim_2'] ?? '');
        $lim3 = getVal($datos['lim_3'] ?? '');
        $lim4 = getVal($datos['lim_4'] ?? '');

        function sumCol($arr, $key) {
            $sum = 0;
            foreach($arr as $row) { if($row[$key] === 1) $sum++; }
            return $sum;
        }

        $org_rows = [$org1, $org2, $org3, $org4];
        $org_na = sumCol($org_rows, 'NA'); $org_nc = sumCol($org_rows, 'NC'); $org_cp = sumCol($org_rows, 'CP'); $org_ct = sumCol($org_rows, 'CT');
        $org_total = $org_nc + $org_cp + $org_ct;
        $org_score = $org_total > 0 ? round((($org_cp * 0.5) + ($org_ct * 1)) / $org_total * 100) : 0;

        $ord_rows = [$ord1, $ord2, $ord3, $ord4, $ord5];
        $ord_na = sumCol($ord_rows, 'NA'); $ord_nc = sumCol($ord_rows, 'NC'); $ord_cp = sumCol($ord_rows, 'CP'); $ord_ct = sumCol($ord_rows, 'CT');
        $ord_total = $ord_nc + $ord_cp + $ord_ct;
        $ord_score = $ord_total > 0 ? round((($ord_cp * 0.5) + ($ord_ct * 1)) / $ord_total * 100) : 0;

        $lim_rows = [$lim1, $lim2, $lim3, $lim4];
        $lim_na = sumCol($lim_rows, 'NA'); $lim_nc = sumCol($lim_rows, 'NC'); $lim_cp = sumCol($lim_rows, 'CP'); $lim_ct = sumCol($lim_rows, 'CT');
        $lim_total = $lim_nc + $lim_cp + $lim_ct;
        $lim_score = $lim_total > 0 ? round((($lim_cp * 0.5) + ($lim_ct * 1)) / $lim_total * 100) : 0;

        $final_total = $org_total + $ord_total + $lim_total;
        $final_score = $final_total > 0 ? round((($org_cp + $ord_cp + $lim_cp) * 0.5 + ($org_ct + $ord_ct + $lim_ct)) / $final_total * 100) : 0;
    @endphp

    <!-- MATRIZ -->
    <table style="font-size: 8px;">
        <tr class="section-header center">
            <td colspan="6">ASPECTO A EVALUAR</td>
        </tr>
        <tr class="bg-light bold center">
            <td width="60%"></td>
            <td width="5%">NA</td>
            <td width="5%">NC (0%)</td>
            <td width="5%">CP (50%)</td>
            <td width="5%">CT (100%)</td>
            <td width="20%">Evidencias</td>
        </tr>
        
        <!-- Organización -->
        <tr class="bg-light bold"><td colspan="6">Organización</td></tr>
        <tr>
            <td>En el área de trabajo no existen objetos (insumos, útiles, herramientas, maquinas, mobiliario, materiales, documentos, etc.) inservibles o dañados</td>
            <td class="center">{{ $org1['NA'] }}</td><td class="center">{{ $org1['NC'] }}</td><td class="center">{{ $org1['CP'] }}</td><td class="center">{{ $org1['CT'] }}</td>
            <td rowspan="4"></td>
        </tr>
        <tr>
            <td>En el área de trabajo no existen objetos que pertenezcan a otras áreas y que no sean usados</td>
            <td class="center">{{ $org2['NA'] }}</td><td class="center">{{ $org2['NC'] }}</td><td class="center">{{ $org2['CP'] }}</td><td class="center">{{ $org2['CT'] }}</td>
        </tr>
        <tr>
            <td>Se mantiene en el área las cantidades mínimas necesarias de los objetos para su uso normal</td>
            <td class="center">{{ $org3['NA'] }}</td><td class="center">{{ $org3['NC'] }}</td><td class="center">{{ $org3['CP'] }}</td><td class="center">{{ $org3['CT'] }}</td>
        </tr>
        <tr>
            <td>Las vías peatonales, escaleras, pasadizos, salidas de emergencia y zonas de equipos de seguridad (extintores, mangueras contra incendios, etc.) se encuentran despejadas, facilitando el desplazamiento</td>
            <td class="center">{{ $org4['NA'] }}</td><td class="center">{{ $org4['NC'] }}</td><td class="center">{{ $org4['CP'] }}</td><td class="center">{{ $org4['CT'] }}</td>
        </tr>
        <tr class="bold center bg-light">
            <td style="text-align: right;">Total</td>
            <td>{{ $org_na }}</td><td>{{ $org_nc }}</td><td>{{ $org_cp }}</td><td>{{ $org_ct }}</td><td></td>
        </tr>
        <tr class="bold center bg-light">
            <td style="text-align: right;">% de Cumplimiento</td>
            <td colspan="4">{{ $org_total > 0 ? $org_score . '%' : '#DIV/0!' }}</td><td></td>
        </tr>

        <!-- Orden -->
        <tr class="bg-light bold"><td colspan="6">Orden</td></tr>
        <tr>
            <td>Todos los objetos tienen una ubicación definida (equipos, mobiliario, útiles de limpieza, herramientas, materiales, etc.) y se encuentran en dicha ubicación, a menos que estén siendo usados</td>
            <td class="center">{{ $ord1['NA'] }}</td><td class="center">{{ $ord1['NC'] }}</td><td class="center">{{ $ord1['CP'] }}</td><td class="center">{{ $ord1['CT'] }}</td>
            <td rowspan="5"></td>
        </tr>
        <tr>
            <td>La ubicación de los objetos se encuentran rotuladas (gabinetes, estantes, racks, etc.) para mantener el orden de los objetos</td>
            <td class="center">{{ $ord2['NA'] }}</td><td class="center">{{ $ord2['NC'] }}</td><td class="center">{{ $ord2['CP'] }}</td><td class="center">{{ $ord2['CT'] }}</td>
        </tr>
        <tr>
            <td>Las vías peatonales, escaleras, pasadizos y salidas de emergencia se encuentran identificadas y señalizadas</td>
            <td class="center">{{ $ord3['NA'] }}</td><td class="center">{{ $ord3['NC'] }}</td><td class="center">{{ $ord3['CP'] }}</td><td class="center">{{ $ord3['CT'] }}</td>
        </tr>
        <tr>
            <td>Las áreas se encuentran identificadas (talleres, servicios, almacenes, etc.) e rotuladas</td>
            <td class="center">{{ $ord4['NA'] }}</td><td class="center">{{ $ord4['NC'] }}</td><td class="center">{{ $ord4['CP'] }}</td><td class="center">{{ $ord4['CT'] }}</td>
        </tr>
        <tr>
            <td>Los paneles o tableros informativos se encuentran ordenados y con información actualizada</td>
            <td class="center">{{ $ord5['NA'] }}</td><td class="center">{{ $ord5['NC'] }}</td><td class="center">{{ $ord5['CP'] }}</td><td class="center">{{ $ord5['CT'] }}</td>
        </tr>
        <tr class="bold center bg-light">
            <td style="text-align: right;">Total</td>
            <td>{{ $ord_na }}</td><td>{{ $ord_nc }}</td><td>{{ $ord_cp }}</td><td>{{ $ord_ct }}</td><td></td>
        </tr>
        <tr class="bold center bg-light">
            <td style="text-align: right;">% de Cumplimiento</td>
            <td colspan="4">{{ $ord_total > 0 ? $ord_score . '%' : '#DIV/0!' }}</td><td></td>
        </tr>

        <!-- Limpieza -->
        <tr class="bg-light bold"><td colspan="6">Limpieza</td></tr>
        <tr>
            <td>El área de trabajo se encuentra limpia (piso, paredes, mobiliario, maquinas, etc.), libre de agua, aceite, petróleo, oxidos, desperdicios y otros</td>
            <td class="center">{{ $lim1['NA'] }}</td><td class="center">{{ $lim1['NC'] }}</td><td class="center">{{ $lim1['CP'] }}</td><td class="center">{{ $lim1['CT'] }}</td>
            <td rowspan="4"></td>
        </tr>
        <tr>
            <td>Existen lugares específicos asignados para la acumulación y disposición (de ser necesario) de residuos</td>
            <td class="center">{{ $lim2['NA'] }}</td><td class="center">{{ $lim2['NC'] }}</td><td class="center">{{ $lim2['CP'] }}</td><td class="center">{{ $lim2['CT'] }}</td>
        </tr>
        <tr>
            <td>Existe un plan de limpieza del área, y los elementos de limpieza están en buen estado</td>
            <td class="center">{{ $lim3['NA'] }}</td><td class="center">{{ $lim3['NC'] }}</td><td class="center">{{ $lim3['CP'] }}</td><td class="center">{{ $lim3['CT'] }}</td>
        </tr>
        <tr>
            <td>Las infraestructuras de las áreas están en buen estado (iluminación, servicios, paredes, techos, barandas, escaleras, puertas, etc.)</td>
            <td class="center">{{ $lim4['NA'] }}</td><td class="center">{{ $lim4['NC'] }}</td><td class="center">{{ $lim4['CP'] }}</td><td class="center">{{ $lim4['CT'] }}</td>
        </tr>
        <tr class="bold center bg-light">
            <td style="text-align: right;">Total</td>
            <td>{{ $lim_na }}</td><td>{{ $lim_nc }}</td><td>{{ $lim_cp }}</td><td>{{ $lim_ct }}</td><td></td>
        </tr>
        <tr class="bold center bg-light">
            <td style="text-align: right;">% de Cumplimiento</td>
            <td colspan="4">{{ $lim_total > 0 ? $lim_score . '%' : '#DIV/0!' }}</td><td></td>
        </tr>
        
        <tr class="bold center" style="background-color: #bbdefb;">
            <td style="text-align: right;">% FINAL DEL AREA</td>
            <td colspan="4">{{ $final_total > 0 ? $final_score . '%' : '#DIV/0!' }}</td><td></td>
        </tr>
    </table>

</body>
</html>
