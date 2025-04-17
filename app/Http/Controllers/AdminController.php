<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class AdminController extends Controller
{
    //show login page
    public function showLoginComponent(){

        return Inertia('Admin/Login');
    }

    //login authentication
    public function accountLogin(Request $request){

        //verify user input 
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        //verify data with database,if account exist then login
        if (Auth::guard('admin')->attempt(['email' => $data['email'], 'password' => $data['password']])) {
            
            //generate new user's session
            $request->session()->regenerate();
            
            return redirect()->route('admin.dashboard')->with('success', 'Login successful!');
        }else{

            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ]);
        }
    }

    public function accountlogout(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();

        //$request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }


}
