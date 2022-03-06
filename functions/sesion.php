<?php
include 'bd.php';
include 'mailer.php';

if(isset($_POST["registro"])){
    registrarUsuario();
    header("Location: ../pages/sesion.php");
} else if($_GET["session"]!="close"){
    $perfil = validUser($_POST['email'], $_POST['pass']);
    setcookie('email', $_POST['email'], time()+3600);
    if($perfil!=null){
        session_start();
        $_SESSION["rol"] = $perfil;
        $_SESSION["email"] = $_POST["email"];
        $perfil_info = json_decode(loadProfileInfo($_POST['email']));
        $_SESSION["nombre"] = $perfil_info["nombre"] . " " . $perfil_info["apellidos"];
        header("Location: ../index.php");
    } else {
        header("Location: ../pages/sesion.php?error=true");
    }
} else {
    session_destroy();
    header("Location: ../index.php");
}

function registrarUsuario(){
    $result = registerUser($_POST["nombre"], $_POST["apellidos"], $_POST["dni"], $_POST["fecha_nac"], $_POST["movil"], $_POST["email"], $_POST["pass"], $_POST["direccion"]);
    if($result == 'OK'){
        enviar_email("admin@transminho.es", "TransMiño", "Registro completado", $_POST["email"], "Su usuario ha sido registrado con éxito en nuestra web.");
        header("Location: ../pages/sesion.php");
    } else {
        $result = urlencode($result);
        $result = str_replace('%0D%0A', ' ', $result);
        header("Location: ../pages/registro.php?error=$result");
    }
}