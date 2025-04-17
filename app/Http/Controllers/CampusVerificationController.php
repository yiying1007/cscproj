<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\IdentityVerification;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationCodeMail;


class CampusVerificationController extends Controller
{
    //show profile Edit page
    public function showIdentityVerificationComponent(){
        $user = auth()->user();
        $verifyCard=IdentityVerification::where('user_id',$user->id)->first();
        return Inertia('User/IdentityVerificationForm',['identity_verifications'=>$verifyCard]);
    }
    //show personal verification card
    public function showVerificationCardComponent($id){
        $verifyCard=IdentityVerification::where('user_id',$id)->first();
        
        return response()->json([
            'verifyCard'=>$verifyCard,
        ]);
        
    }


    //send code to campus email
    public function generateVerifyCode(Request $request)
    {
        //verify user input 
        $data = $request->validate([
            'email' => [
                'required',
                'email',
                'regex:/^[a-zA-Z0-9._%+-]+@(segi4u\.my|segi\.edu\.my)$/i'
            ]
        ]);
        
        

        $verify=IdentityVerification::where('email',$data['email'])->first();
        if ($verify){
            //check this email already verify or not
            if ($verify->user_id !== null) {
                
                return back()->withErrors(['email' => 'This email cannot be used as it has already been verified.']);
            }
            //generate and store code in users table
            $user = auth()->user();
            $verifyCode = mt_rand(100000, 999999);
            $user->verification_code=$verifyCode;
            $user->save();
            //send mail
            $subject="<h1>Campus Identity Verification Code</h1>";
            $message="<p>Your verification code is: <strong>'".$verifyCode ."'</strong></p>";
            Mail::to($verify->email)->send(new VerificationCodeMail($subject,$message));

            return redirect()->back()->with('success', 'The verification code has been successfully sent to the email.');

        }else{
            return back()->withErrors(['email' => 'This email not recorded.Try to contact the administrator.']);
        }

    }
    
    public function identityAuthentication(Request $request){
        
        $data = $request->validate([
            'email' => 'required|email|regex:/^[a-zA-Z0-9._%+-]+@segi4u\.my$/',
            'verifyCode' => 'required|digits:6',
        ]);

        $verify=IdentityVerification::where('email',$data['email'])->first();
        $user=User::where('verification_code',$data['verifyCode'])->first();
        if($user && $verify){
            $codeLifetime = 5; // 5 minutes
            $updateAt = $user->last_login_time; 
            if ($updateAt->diffInMinutes(now()) > $codeLifetime) {
                $user->verification_code = null;
                $user->save();

                return back()->withErrors(['verifyCode' => 'Verification code has expired.']);
            }

            //insert user id to identity table
            $verify->user_id=$user->id;
            $verify->save();
            $user->verification_code = null;
            $user->position=$verify->role;
            $user->save();
            return redirect()->route('user.index')->with('success', 'Verification successfully.!');
            
        
        }else{
            if (!$user) {
                return back()->withErrors(['verifyCode' => 'Verification code not match.']);
            }
            
            if (!$verify) {
                return back()->withErrors(['error' => 'Verification infomation not match.Please check again']);
            }

            return back()->withErrors(['error' => 'Verification failed.']);
        }
    }
}
