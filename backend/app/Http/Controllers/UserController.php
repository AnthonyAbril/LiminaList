<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log; // ✅ Asegurar que `Log` está importado\
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;   // ⬅︎ asegúrate de tenerlo arriba del controlador

class UserController extends Controller
{
    public function listasCompartidas()
        {
            $user = Auth::user();
            // Encuentra todas las filas en permisos donde el usuario es colaborador
            $permisos = \DB::table('permisos')->where('user_id', $user->id)->get();

            // Trae las listas correctamente (por id Y user_id del dueño)
            $listas = collect();

            foreach ($permisos as $permiso) {
                $lista = \App\Models\Lista::where('id', $permiso->lista_id)
                    ->where('user_id', $permiso->lista_user_id)
                    ->with('tareas')
                    ->first(); // <- AQUÍ ESTÁ EL CAMBIO
                if ($lista) {
                    $lista->permiso_colaborador = $permiso->permiso;
                    $listas->push($lista);
                }
            }

            return response()->json($listas->values());
        }








    public function getAjustes(Request $request)
    {
        $user = $request->user();
        $ajustes = $user->theme_colors ?? [];

        // ✅ Evaluar modo oscuro automático
        $modoOscuro = $ajustes['modoOscuro'] ?? false;

        
        $ajustes['modoOscuro'] = $modoOscuro;

        // 🔹 Agrega patrones por defecto dinámicamente
        $ajustes['patronesDefault'] = [
            [
                'id' => 'default',
                'nombre' => 'Estándar',
                'fijo' => true,
                'claro' => [
                    'primario' => '#FF9E16',
                    'secundario' => '#FFBA5A',
                    'terciario' => '#ffca81',
                    'texto' => '#ffffff'
                ],
                'oscuro' => [
                    'primario' => '#1e3345',
                    'secundario' => '#1d5a77',
                    'terciario' => '#3e95be',
                    'texto' => '#aed5e0'
                ]
            ],
            [
                'id' => 'minimalista',
                'nombre' => 'Minimalista',
                'fijo' => true,
                'claro' => [
                    'primario' => '#ffffff',
                    'secundario' => '#f0f0f0',
                    'terciario' => '#dcdcdc',
                    'texto' => '#000000'
                ],
                'oscuro' => [
                    'primario' => '#1c1c1c',
                    'secundario' => '#2a2a2a',
                    'terciario' => '#444444',
                    'texto' => '#ffffff'
                ]
            ],
            [
                'id' => 'prismo',
                'nombre' => 'Prismo',
                'fijo' => true,
                'claro' => [
                    'primario' => '#d0646d',
                    'secundario' => '#e9c03b',
                    'terciario' => '#5482bc',
                    'texto' => '#ffffff'
                ],
                'oscuro' => [
                    'primario'   => '#5D2C31',
                    'secundario' => '#A88F14',
                    'terciario'  => '#1D3C60',
                    'texto'      => '#F5F5F5'
                ],
            ],
            [
                'id' => 'verde-menta',
                'nombre' => 'Verde Menta',
                'fijo' => true,
                'claro' => [
                    'primario' => '#a8f0c6',
                    'secundario' => '#6de3b4',
                    'terciario' => '#36c7a7',
                    'texto' => '#003d32'
                ],
                'oscuro' => [
                    'primario' => '#0e3b30',
                    'secundario' => '#146c54',
                    'terciario' => '#1fa187',
                    'texto' => '#b9f3de'
                ]
            ],
            [
                'id' => 'rosa-pastel',
                'nombre' => 'Rosa Pastel',
                'fijo' => true,
                'claro' => [
                    'primario' => '#f8bbd0',
                    'secundario' => '#f48fb1',
                    'terciario' => '#f06292',
                    'texto' => '#3b0d1a'
                ],
                'oscuro' => [
                    'primario' => '#4a2230',
                    'secundario' => '#7a2f4b',
                    'terciario' => '#a03a61',
                    'texto' => '#ffcfe4'
                ]
            ]
        ];

        return response()->json($ajustes);
    }



    public function guardarAjustes(Request $request)
    {
        $data = $request->validate([
            'modoOscuro' => 'required|boolean',
            'patronActivo' => 'required|string',
            'patronesGuardados' => 'nullable|array',
            'modoOscuroAutomatico' => 'nullable|boolean',
            'horaInicioAuto' => 'nullable|string',
            'horaFinAuto' => 'nullable|string'
        ]);

        $user = $request->user();
        $user->theme_colors = $data;
        $user->save();

        return response()->json(['success' => true]);
    }




    // en UserController
    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $user = $request->user();
        $user->name = $data['name'];
        $user->save();

        return response()->json(['success' => true, 'name' => $user->name]);
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'password' => 'required|string|min:8'
        ]);

        $user = $request->user();
        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();
        $user->delete(); // soft delete si está habilitado
        return response()->json(['success' => true]);
    }

}
