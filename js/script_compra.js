let total = 0;
/**
 * Rellena el formulario con los datos de viajes provenientes de cookies formateados a JSON
 * @param {*} json_ida 
 * @param {*} json_vuelta 
 */
function gestionarDatosCompra(json_ida, json_vuelta = null){
    console.log(json_ida, json_vuelta);

    for(exp in json_ida){
        console.log(json_ida[exp]);

        if(exp != 'date' && exp != 'people'){
            let value = json_ida.date + "_" + exp + "_" + json_ida[exp][0].stop + "_" + json_ida[exp][1].stop;
            $("#t_ida").append(
                '<tr>' +
                    '<td>' + json_ida[exp][0].time + '</td><td>' + json_ida[exp][1].time + '</td>' +
                    '<td><input type="radio" name="h_ida" value="' + value + '" />' +
                '</tr>'
            );
        }
    }

    $("#trayecto_ida").append(
        '<input type="hidden" name="f_ida" value="' + json_ida.date + '" />'
    )

    ////////

    if(json_vuelta != null){
        for(exp in json_vuelta){
            console.log(json_vuelta[exp]);
    
            if(exp != 'date' && exp != 'people'){
                let value = json_vuelta.date + "_" + exp + "_" + json_vuelta[exp][1].stop + "_" + json_vuelta[exp][0].stop;
                $("#t_vuelta").append(
                    '<tr>' +
                        '<td>' + json_vuelta[exp][1].time + '</td><td>' + json_vuelta[exp][0].time + '</td>' +
                        '<td><input type="radio" name="h_vuelta" value="' + value + '" />' +
                    '</tr>'
                );
            }
        }
    
        $("#trayecto_vuelta").append(
            '<input type="hidden" name="f_vuelta" value="' + json_vuelta.date + '" />'
        )
    }
    else{
        $('#trayecto_vuelta').remove();
    }

    ////////

    let num_viajeros = parseInt(json_ida.people.anc) + parseInt(json_ida.people.adu) + parseInt(json_ida.people.jov);

    $("#viajeros").append(
        '<input type="hidden" name="num_viajeros" value="' + num_viajeros + '" />'
    );

    for (let index = 1; index <= num_viajeros-1; index++) {
        $("#viajeros").append(
            '<div class="row viajero_adicional">'+
                '<h3>Datos del viajero adicional '+ index +'</h3>'+
                '<h6>Los campos requeridos están marcados con *</h6>'+
                    '<span class="col-12 col-md-6">'+
                        '<label class="form-check-label" for="nombre_' + index + '">Nombre*:</label>'+
                        '<input class="form-control" type="text" name="nombre_' + index + '" required>'+
                    '</span>'+
                    '<span class="col-12 col-md-6">'+
                        '<label class="form-check-label" for="apellidos_' + index + '">Apellidos*:</label>'+
                        '<input class="form-control" type="text" name="apellidos_' + index + '" required>'+
                    '</span>'+
                    '<span class="col-12 col-md-4">'+
                        '<label class="form-check-label" for="dni_' + index + '" data-toggle="tooltip" title="No requerido para viajeros menores de 14 años">DNI<span class="help">?</span>:</label>'+
                        '<input class="form-control" type="text" name="dni_' + index + '">'+
                    '</span>'+
                    '<span class="col-12 col-md-4">'+
                        '<label class="form-check-label" for="telefono_' + index + '">Teléfono:</label>'+
                        '<input class="form-control" type="text" name="telefono_' + index + '">'+
                    '</span>'+
                    '<span class="col-12 col-md-4">'+
                        '<label for="fecha_' + index + '">Fecha de nacimiento*:</label>'+
                        '<input class="form-control" type="date" name="fecha_' + index + '" required>'+
                    '</span>'+
                    '<span class="col-12">'+
                        '<label class="form-check-label" for="direccion_' + index + '">Dirección:</label>'+
                        '<input class="form-control" type="text" name="direccion_' + index + '">'+
                    '</span>'+
            '</div>'
        );
    }

    ////////

    $.post("../functions/bd.php", {
        method: "loadFares"
    },
    function(data, status){
        var listaTarifas = JSON.parse(data);
        var travel_example = json_ida[Object.keys(json_ida)[0]]; //Un ejemplo para saber entre que paradas estamos pidiendo

        let precio_base = 0;
        var count = false; //Saber cuando hay que contar

        if(travel_example[0].stop < travel_example[1].stop){
            listaTarifas.forEach(element => {
                if(element.between[0] == travel_example[0].stop){
                    count = true; //Cuenta abierta
                }
                if(count) precio_base += parseFloat(element.price);
                if(element.between[1] == travel_example[1].stop){
                    count = false; //Cuenta cerrada
                }
            });
        }
        else if(travel_example[0].stop > travel_example[1].stop){
            //Recorrer el array inversamente
            listaTarifas.slice().reverse().forEach(element => {
                if(element.between[1] == travel_example[0].stop){
                    count = true; //Cuenta abierta
                }
                if(count) precio_base += parseFloat(element.price);
                if(element.between[0] == travel_example[1].stop){
                    count = false; //Cuenta cerrada
                }
            });
        }

        precio_base = Math.round(precio_base * 100) / 100;
        if(json_vuelta!=null){
            precio_base = precio_base*2;
        }
        let precio_adu = precio_base * json_ida.people.adu;
        let precio_anc = precio_base * 0.5 * json_ida.people.anc;
        let precio_jov = precio_base * 0.9 * json_ida.people.jov;
        total = precio_adu + precio_anc + precio_jov;

        $('#t_pago').append(
            "<tr><th>Precio base</th><th></th><th>" + precio_base.toFixed(2) + " €</th></tr>" +
            ( json_ida.people.adu > 0 ? "<tr><td>Precio total adultos (100%)</td><td></td><td>" + precio_adu.toFixed(2) + " €</td></tr>" : "" ) +
            ( json_ida.people.anc > 0 ? "<tr><td>Precio total reducido ancianos (50%)</td><td></td><td>" + precio_anc.toFixed(2) + " €</td></tr>" : "" ) +
            ( json_ida.people.jov > 0 ? "<tr><td>Precio reducido jóvenes (90%)</td><td></td><td>" + precio_jov.toFixed(2) + " €</td></tr>" : "" ) +
            "<tr><td>Pago con puntos:</td><td><input type='number' id='points' name='points' value='0' min='0' /></td><td id='points_value'>0 €</td></tr>" +
            "<tr><th>TOTAL</th><th></th><th><input type='text' id='total_price' name='total' class='readonly form-control-plaintext' value='" + total.toFixed(2) + " €' readonly /></th></tr>"
        );

        $.post("../functions/bd.php", {
            method: "loadPoints"
        },
        function(data, status){
            $('#points').attr('step', 500).attr('max', data).keydown(function(e){
                if ( e.keyCode ) {
                    return false;
                }
            });
        });
    });
}

/**
 * Valida que los datos de la compra sean correctos
 * @returns Mensaje de error (si lo hubiera)
 */
function validarCompra(){ 
    let msg = "";
    let result = true;
    let validar = ['ida'];
    if($('#trayecto_vuelta').length) validar = ['ida', 'vuelta'];

    for(v of validar){
        if($('#a_'+v).val()=="" || !$("input[name='h_"+v+"']:checked").val()){
            msg += "Debe completar todos los campos de "+v+".\n";
            result = false;
        }

        var select = $('#a_'+v).val();
        
        if(select.length != $('.viajero_adicional').length + 1){
            msg += "Debe seleccionar a la "+v+" tantos asientos como viajeros (Usted más los adicionales).\n"
            result = false;
        }
    }

    if($('#forma_pago_seleccionar').val()==""){
        msg += "Debe seleccionar una forma de pago.\n";
        result = false;
    }
    else if($('#forma_pago_seleccionar').val()=="t"){
        if($('#nombre').val()=="" || $('#cod_tarjeta').val()=="" || $('#cvv').val()==""){
            msg += "Debe rellenar los datos de tarjeta.\n";
            result = false;
        }
    }


    if(!result){
        alert(msg);
    }

    return result;
}

/**
 * No permitir comprar si no estás registrado
 * Quita la sección de Asientos disponibles, forma de pago y comprar
 * Y se añade un aviso para hacer login o registrarse
 */
function invitado(){ 
    $('#viajeros').remove();
    $('#forma_pago').remove();
    $('#datos_pago').remove();
    $('#formarea_conf').remove();
    $('#compra_anonima').css("display", "block");
}

['ida', 'vuelta'].forEach(element => {
    $('#t_'+element).delegate('input:radio', 'change', function(e){
        $('.asientos_'+element).css('visibility', 'visible');
        $('#a_'+element).find('option').remove();
        for(var i=1; i<=50; i++) $('#a_'+element).append('<option id="a_'+element+'_'+i+'" value="'+i+'">'+i+'</option>'); //50 asientos por bus
    
        let value = $(this).val().split("_");
console.log(value);
        $.post("../functions/bd.php", {
            method: "loadOccupiedSeats",
            date: value[0],
            exp: value[1],
            id_origin: value[2],
            id_destination: value[3]
        },
        function(data, status){
            var json = JSON.parse(data);
            console.log(json);
            for(var a of json){
                $('#a_'+element+'_'+a).remove();
            }
        });
    });
});

$('#forma_pago_seleccionar').change(function(){
    console.log($(this).val());
    if($(this).val()=='p'){
        $('#datos_pago_paypal').css("display", "flex");
        $('#datos_pago_tarjeta').css("display", "none");
    }
    else if($(this).val()=='t'){
        $('#datos_pago_paypal').css("display", "none");
        $('#datos_pago_tarjeta').css("display", "flex");
    }
});

$('#t_pago').on("change", "#points", function(e){
    let money = $('#points').val()/2000;
    $('#points_value').text("-" + money + " €");
    $('#total_price').val((total - money).toFixed(2) + " €");
});