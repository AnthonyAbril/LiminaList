<?php namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TareaFecha;
use Illuminate\Support\Facades\DB;

class SyncRoutineProgress extends Command
{
    protected $signature = 'tasks:sync-routine';
    protected $description = 'Sincroniza en tasks.progreso el valor de hoy de tareas rutinarias';

    public function handle()
    {
        $hoy = now()->toDateString();

        DB::transaction(function () use ($hoy) {
            TareaFecha::with('tarea')
                ->where('fecha', $hoy)
                ->get()
                ->filter(fn($tf) => $tf->tarea->rutinario)
                ->each(fn($tf) => $tf->tarea->update(['progreso' => $tf->progreso]));
        });

        $this->info("Sincronizadas rutinas de {$hoy}");
    }
}
