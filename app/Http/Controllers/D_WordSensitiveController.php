<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLogs;
use App\Models\WordSensitive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class WordSensitiveController extends Controller
{
    //
    public function showWordSensitiveManagementComponent()
    {
        // Get all sensitive words
        $sensitiveWords = WordSensitive::all();

        return Inertia::render('Admin/WordSensitiveManage/WordSensitiveManagement', [
            'sensitiveWords' => $sensitiveWords,
        ]);
    }

    public function createWordSensitive(Request $request){
        $admin = auth('admin')->user();
        //verify input 
        $data=$request->validate([
            'word' => 'required|string|max:150',
            'type' => 'required|string',
        ]);
        
        //create word into db
        WordSensitive::create([
            'word' => $request->word,
            'type' => $request->type,
        ]);
        //insert admin logs
        AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Create",
            'details'=> $admin->name.' create word: '.$data['word'],
        ]);

        return redirect()->back()->with('success', 'Sensitive word create  successfully!');
        
    }

    public function editWordSensitive(Request $request,$id){
        
        $admin = auth('admin')->user();
        $wordSensitive=WordSensitive::findOrFail($id);
        //validate user input
        $data=$request->validate([
            'word' => 'required|string|max:150',
            'type' => 'required|string',
        ]);

        foreach (['word', 'type'] as $field) {
            if (array_key_exists($field, $data)) {
                $wordSensitive->{$field} = $data[$field];
            }
        }

        $wordSensitive->save();
        
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Edit",
            'details'=> $admin->name.' edit word ID: '.$id.', word: '.$data['word'],
        ]);

        return redirect()->back()->with('success', 'Sensitive word updated successfully!');
        
    }
    //delete
    public function deleteWordSensitive($id){
        $admin = auth('admin')->user();
        $wordSensitive=WordSensitive::findOrFail($id);

        $wordSensitive->delete();
        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Delete",
            'details'=> $admin->name.' delete word ID: '.$id.', word: '.$wordSensitive->word,
        ]);
        return redirect()->back()->with('success', 'Sensitive word deleted successfully!');
        
    }
}
