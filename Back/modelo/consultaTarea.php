<?php
include "../modelo/dbConex.php";
class consultaTarea{
    private $id;
    private $tipo;
    public static function getAllTareas(){
        $conexion = conexionBD::conectar();
        $sql = "SELECT * FROM tareas";
        $result = $conexion->query($sql);
        $conexion->close();
        return $result->fetch_all(MYSQLI_ASSOC);   
}

    public static function getTareaById($id){
        $conexion = conexionBD::conectar();
        $sql = "SELECT * FROM tareas WHERE id = $id";
        $result = $conexion->query($sql);
        $conexion->close();
        return $result->fetch_assoc();
    }
    
    public static function insertarMarca($nombre){
        $conexion = conexionBD::conectar();
        $sql = "INSERT INTO Marcas (nombre) VALUES ('$nombre')";
        $conexion->query($sql);
        return $conexion->insert_id;
        $conexion->close();
        
    }
    public static function actualizarMarca($id, $nombre){
        $conexion = conexionBD::conectar();
        $sql = "UPDATE Marcas SET nombre = '$nombre' WHERE id = $id";
        $conexion->query($sql);
        return $conexion->affected_rows;
        $conexion->close();
    }
    public static function eliminarMarca($id){
        $conexion = conexionBD::conectar();
        $sql = "DELETE FROM Marcas WHERE id = $id";
        $conexion->query($sql);
        return $conexion->affected_rows;
        $conexion->close();
        
    }
}?>
