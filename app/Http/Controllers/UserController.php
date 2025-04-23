<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\IdentityVerification;
use App\Models\Post;
use App\Models\Like;
use App\Models\PostType;
use App\Models\Communities;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
//use Illuminate\Support\Facades\Session;
//use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class UserController extends Controller
{
    //show login page
    public function showLoginComponent(){

        return Inertia('User/Login');
    }
    //show register page
    public function showRegisterComponent(){

        return Inertia('User/Register');
    }
    //show forgot password page
    public function showForgotPasswordComponent(){

        return Inertia('User/ForgotPassword');
    }
    //show password reset page
    public function showPasswordResetComponent(){

        return Inertia('User/PasswordReset');
    }
    //show profile page
    public function showProfileComponent(){
        $userId=auth()->user()->id;
        $postTypes=PostType::all();
        $posts=Post::leftJoin('communities', 'posts.communities_id', '=', 'communities.id') 
                    ->leftJoin('post_types', 'posts.type_id', '=', 'post_types.id')
                    ->where('posts.user_id',$userId)
                    ->where('posts.status','Active')
                    ->select('posts.*', 'communities.name as community_name','post_types.type_name as post_type')
                    ->latest()
                    ->paginate(6);
        
        //show like 
        $posts->each(function ($post) use ($userId) {
            $post->likeCount = Like::where('content_type','Post')
                                    ->where('content_id', $post->id)
                                    ->count()?? 0;
                                    
            $post->isLiked = Like::where('content_type','Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $userId)
                                ->exists();
            
        });

        return Inertia('User/UserProfile/Profile',[
            'posts'=>$posts->items(),
            'hasMorePosts' => $posts->hasMorePages(),
            'postTypes' => $postTypes,
        ]);
    }
    // load more post
    public function loadMorePosts(Request $request)
    {
        $user = auth()->user();
        $page = $request->input('page', 1);
        $perPage = 6; 

        // load more posts
        $posts=Post::leftJoin('communities', 'posts.communities_id', '=', 'communities.id') 
                    ->where('posts.user_id',$user->id)
                    ->where('posts.status','Active')
                    ->select('posts.*', 'communities.name as community_name')
                    ->latest()
                    ->paginate($perPage, ['*'], 'page', $page);
        //
        $posts->each(function ($post) use ($user) {
            $post->likeCount = Like::where('content_type', 'Post')
                                    ->where('content_id', $post->id)
                                    ->count() ?? 0;
    
            $post->isLiked = Like::where('content_type', 'Post')
                                ->where('content_id', $post->id)
                                ->where('user_id', $user->id)
                                ->exists();
        });
        return response()->json([
            'posts'=>$posts->items(),
            'hasMorePosts' => $posts->hasMorePages(), 
        ]);
    }
    //show profile Edit page
    public function showProfileEditComponent(){

        return Inertia('User/UserProfile/ProfileEdit');
    }
    //show reset password page
    public function showResetPasswordComponent(){

        return Inertia('User/UserProfile/ResetPassword');
    }


    //login authentication
    public function accountLogin(Request $request){

        //verify user input 
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return back()->withErrors(['email' => 'The provided credentials do not match our records.']);
        }
        if ($user->acc_status === 'Block') {
            if ($user->acc_block_until && Carbon::parse($user->acc_block_until)->isFuture()) {
                return back()->withErrors(['email' => 'Your account is blocked until ' . Carbon::parse($user->acc_block_until)->toDateTimeString()]);
            } else {
                // If block period has ended, reactivate account
                $user->update(['acc_status' => 'Active', 'acc_block_until' => null]);
            }
            
        }
        if ($user->acc_status === 'Inactive') {
            return back()->withErrors(['email' => 'Your account is Inactive']);
        }
        

        //verify data with database,if account exist then login
        if (Auth::guard('web')->attempt(['email' => $data['email'], 'password' => $data['password'],'acc_status'=>'Active'])) {
            
            //generate new user's session
            $request->session()->regenerate();

            //check is verified,if not redirect to verification page
            $user = Auth::user();
            $isVerified = IdentityVerification::where('user_id', $user->id)->exists();

            if (!$isVerified) {
                return redirect()->route('user.identityVerification')
                    ->with('error', 'Please complete identity verification.');
            }

            return redirect()->route('user.index')->with('success', 'Login successful!');
        }else{
            return back()->withErrors(['password' => 'Password not match']);
        }
    }
    //register authentication
    public function accountRegister(Request $request){

        //verify user input 
        $data=$request->validate([
            'nickname' => 'required|string|max:60|unique:'.User::class,
            'email' => 'required|email|unique:'.User::class,
            'password' => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required|string|min:6',
        ]);

        $defaultAvatarPath = 'avatar/defaultAvatar.png';
        //create user into db
        $user = User::create([
            'nickname' => $data['nickname'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'acc_status'=> "Active",
            'avatar' => $defaultAvatarPath,
        ]);

        Auth::login($user);
        //link to other page 
        return redirect()->route('user.identityVerification')->with('success', 'Register successfully!');
    }

    //logout current account
    public function accountlogout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        return redirect()->route('user.welcome')->with('success', 'Logout successfully!');
    }

    
    //generate and send verification code to mail 
    public function generateVerifyCode(Request $request)
    {
         //verify user input 
         $data = $request->validate([
            'email' => 'required|email',
        ]);
        //check email exist
        $user=User::where('email',$data['email'])->first();
        if ($user){

            $verifyCode = mt_rand(100000, 999999);
            //store code in users table
            $user->verification_code=$verifyCode;
            $user->save();
            //mail content
            $subject="<h1>Password Reset Verification Code</h1>";
            $message="<p>Your password reset verification code is: <strong>'".$verifyCode ."'</strong></p>";
            Mail::to($user->email)->send(new ResetPasswordMail($subject,$message));

            return redirect()->route('user.passwordReset')->with('success', 'Send Mail successful!');
            
        }else{
            return back()->withErrors(['email' => 'Email not found.']);
        }

    }

    //passwordReset
    public function passwordReset(Request $request)
    {
         //verify user input 
         $data = $request->validate([
            'verifyCode' => 'required|digits:6',
            'password' => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required|string|min:6',
        ]);

        $user=User::where('verification_code',$data['verifyCode'])->first();
        if ($user){

             // Check if the verification code has expired
            $codeLifetime = 5; // 10 minutes
            $updateAt = $user->last_login_time; 
            if ($updateAt->diffInMinutes(now()) > $codeLifetime) {
                $user->verification_code = null;
                $user->save();
                return redirect()->route('user.forgotPassword')->with('error', 'Verification code has expired.!');
            }
            $user->password = Hash::make($data['password']);
            $user->verification_code = null;
            $user->save();

            return redirect()->route('user.login')->with('success', 'Password Reset successful!');
            
        }else{
            return back()->withErrors(['verifyCode' => 'Verification code not match.']);
            
        }

    }

    public function profileEdit(Request $request){
        
        $user = auth()->user();
        //verify user input 
        $data=$request->validate([
            'nickname' => 'required|string|max:60|unique:users,nickname,'. $user->id,
            'gender' => 'nullable',
            'intro' => 'nullable|string|max:150',
        ]);
        
        //if value has change,then update
        foreach (['nickname', 'gender', 'intro'] as $field) {
            if (array_key_exists($field, $data)) {
                $user->{$field} = $data[$field];
            }
        }

        $user->save();
        
        return redirect()->route('user.profile')->with('success', 'Profile updated successfully!');
    }

    public function avatarEdit(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $avatarName = $user->id . '_' . time() . '.' . $avatar->getClientOriginalExtension();

            //delete old avatar
            if ($user->avatar && $user->avatar !== 'avatar/defaultAvatar.png') {

                Storage::disk('s3')->delete($user->avatar);

            }
                // store avatar to aws s3
                $path = $avatar->storeAs('avatar', $avatarName, 's3');
                Storage::disk('s3')->setVisibility($path, 'public');
                
                // store avatar url to db
                $user->avatar = 'avatar/'.$avatarName;
                $user->save();

                return redirect()->back()->with('success', 'Avatar updated successfully!');
        }
        return back()->withErrors(['avatar' => 'Please upload a valid image file.']);
    }
    //reset password 
    public function resetPassword(Request $request)
    {   
        $user= auth()->user();
         //verify user input 
         $data = $request->validate([
            'password' => 'required',
            'newPassword' => 'required|string|min:6',
            'password_confirmation'=> 'required|same:newPassword',
        ]);
        //check password with db
        if (Hash::check($data['password'], $user->password)) {
            $user->password = Hash::make($data['newPassword']);
            $user->save();
            return redirect()->route('user.profile')->with('success', 'Password changed successfully!');
        }else{
            return redirect()->back()->withErrors(['password' => 'The provided password does not match your current password.']);
        }
    }
}
