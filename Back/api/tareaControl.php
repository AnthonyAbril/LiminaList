<?php
include '../modelo/consultaTarea.php';

header("Access-Control-Allow-Origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        header("Content-Type: application/json; charset=UTF-8");
        if (isset($_GET['id'])) {
            
            // Obtener un producto por ID.
            $id = (int) $_GET['id']; // Sanitizar el ID.
            $tareas = consultaTarea::getTareaById($id);
            echo json_encode($tareas ?: ["error" => "Tarea no encontrada"]);
        } else {
            
            // Obtener todos los pedidos.
            $tareas = consultaTarea::getAllTareas();
            echo json_encode($tareas);
        }
        break;
}
?>