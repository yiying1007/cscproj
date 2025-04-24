<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\AdminLogs;
use App\Models\User;
use App\Models\Communities;
use App\Models\Post;
use App\Models\Message;
use App\Models\Report;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Jobs\UnblockUserJob;
use Illuminate\Support\Facades\Mail;
use App\Mail\AccBlockMail;
use App\Notifications\SendNotification;

class ReportManageController extends Controller
{
    //show post report
    public function showPostReportManagementComponent(){
        
        $postReports = Report::leftJoin('users','reports.user_id','=','users.id')
            ->leftJoin('admins','admins.id','=','reports.reviewed_by')
            ->leftJoin('posts','posts.id','=','reports.content_id')
            ->leftJoin('identity_verifications', 'identity_verifications.user_id', '=', 'users.id')
            ->select('reports.*',
                'users.position',
                'users.acc_violation_count',
                'users.acc_status',
                'identity_verifications.name as user_name',
                'identity_verifications.email as segi_email',
                'identity_verifications.course',
                'posts.title',
                'posts.content',
                'posts.media_url',
                'admins.name as admin_name')
            ->where('content_type','Post')
            ->orderByRaw("CASE WHEN reports.status = 'Pending' THEN 1 ELSE 2 END DESC")
            ->orderBy('reports.updated_at', 'DESC')
            ->get();
        
        
        return Inertia('Admin/ReportManage/PostReportManagement', [
            'postReports' => $postReports,
        ]);
    }
    //show community report
    public function showCommunityReportManagementComponent(){
        
        $communityReports = Report::leftJoin('users','reports.user_id','=','users.id')
            ->leftJoin('admins','admins.id','=','reports.reviewed_by')
            ->leftJoin('communities','communities.id','=','reports.content_id')
            ->leftJoin('identity_verifications', 'identity_verifications.user_id', '=', 'users.id')
            ->select('reports.*',
                'users.position',
                'users.acc_violation_count',
                'users.acc_status',
                'identity_verifications.name as user_name',
                'identity_verifications.email as segi_email',
                'identity_verifications.course',
                'communities.name as community_name',
                'communities.type as community_type',
                'communities.description',
                'communities.avatar',
                'admins.name as admin_name')
            ->where('content_type','Community')
            ->orderByRaw("CASE WHEN reports.status = 'Pending' THEN 1 ELSE 2 END DESC")
            ->orderBy('reports.updated_at', 'DESC')
            ->get();
                    
        return Inertia('Admin/ReportManage/CommunityReportManagement', [
            'communityReports' => $communityReports,
        ]);
    }

    //show comment report
    public function showCommentReportManagementComponent(){
        
        $commentReports = Report::leftJoin('users','reports.user_id','=','users.id')
            ->leftJoin('admins','admins.id','=','reports.reviewed_by')
            ->leftJoin('comments','comments.id','=','reports.content_id')
            ->leftJoin('identity_verifications', 'identity_verifications.user_id', '=', 'users.id')
            ->select('reports.*',
                'users.position',
                'users.acc_violation_count',
                'users.acc_status',
                'identity_verifications.name as user_name',
                'identity_verifications.email as segi_email',
                'identity_verifications.course',
                'comments.content',
                'admins.name as admin_name')
            ->where('content_type','Comment')
            ->orderByRaw("CASE WHEN reports.status = 'Pending' THEN 1 ELSE 2 END DESC")
            ->orderBy('reports.updated_at', 'DESC')
            ->get();
        
        return Inertia('Admin/ReportManage/CommentReportManagement', [
            'commentReports' => $commentReports,
        ]);
    }

    //show chat report
    public function showChatReportManagementComponent(){
        
        $chatReports = Report::leftJoin('users','reports.user_id','=','users.id')
            ->leftJoin('admins','admins.id','=','reports.reviewed_by')
            ->leftJoin('messages','messages.id','=','reports.content_id')
            ->leftJoin('identity_verifications', 'identity_verifications.user_id', '=', 'users.id')
            ->select('reports.*',
                'users.position',
                'users.acc_violation_count',
                'users.acc_status',
                'identity_verifications.name as user_name',
                'identity_verifications.email as segi_email',
                'identity_verifications.course',
                'messages.content',
                'messages.media_url',
                'messages.media_name',
                'admins.name as admin_name')
            ->where('content_type','Chat')
            ->orderByRaw("CASE WHEN reports.status = 'Pending' THEN 1 ELSE 2 END DESC")
            ->orderBy('reports.updated_at', 'DESC')
            ->get();
        
        
        return Inertia('Admin/ReportManage/ChatReportManagement', [
            'chatReports' => $chatReports,
        ]);
    }
    //block user function
    protected function blockUser($user, $blockUntilRaw, $admin, $report, $contentTypeLabel)
    {
        if (!empty($blockUntilRaw)) {
            $blockUntil = Carbon::parse($blockUntilRaw);
            //block user acc
            $user->update([
                'acc_status' => 'Block',
                'acc_block_until' => $blockUntil,
            ]);
            //auto unblock user acc
            UnblockUserJob::dispatch($user->id)->delay($blockUntil);
            //send mail to user
            $subject = "<h1>SEGiSpace account Blocked</h1>";
            $message = "<h1>Your {$contentTypeLabel} contains prohibited content.</h1>
                <p>After review, your account [`{$user->email}`] has 
                been temporarily suspended due to a violation of our platform's 
                guidelines: [`{$report->reason}`]. This action is taken to maintain
                a safe and healthy community environment.</p>
                <p>Your account will remain blocked from [`" . now() . "`] until [`{$user->acc_block_until}`]. 
                During this period, you will not be able to log in or use any platform features.</p>
                <p>If further violations occur after your account is reinstated, stricter actions may be taken, including permanent suspension.</p>
                <p>Thank you for your understanding and cooperation.</p>";

            Mail::to($user->email)->send(new AccBlockMail($subject, $message));
        }
    }
    //handle report
    public function handleReport(Request $request, $reportId, $contentId)
    {
        $admin = auth('admin')->user();
        $data = $request->validate([
            'review_notes' => 'nullable',
            'acc_block_until' => 'nullable|after:now',
            'status' => 'required',
        ]);
        // Check if the report exists
        $report = Report::findOrFail($reportId);
        $contentType = $report->content_type;
        // Check if the content type is valid
        $modelMap = [
            'Post' => Post::class,
            'Comment' => Comment::class,
            'Community' => Communities::class,
            'Chat' => Message::class,
        ];
        //user id
        $ownerColumn = [
            'Post' => 'user_id',
            'Comment' => 'user_id',
            'Community' => 'created_by',
            'Chat' => 'sender_id',
        ];
        // notification name
        $notificationMap = [
            'Post' => 'postReport_byAdmin',
            'Comment' => 'commentReport_byAdmin',
            'Community' => 'community_blockedByAdmin',
            'Chat' => 'chatReport_byAdmin',
        ];
        //email title name
        $labelMap = [
            'Post' => 'post',
            'Comment' => 'comment',
            'Community' => 'community',
            'Chat' => 'chat message',
        ];

        DB::transaction(function () use (
            $modelMap, $ownerColumn, $notificationMap, $labelMap,
            $contentType, $contentId, $admin, $report, $data, $request
        ) {
            // identity class(post, comment, community, message)
            $modelClass = $modelMap[$contentType];
            $content = $modelClass::findOrFail($contentId);
            $user = User::findOrFail($content->{$ownerColumn[$contentType]});

            if ($data['status'] === 'Resolved') {
                $report->update([
                    'review_notes' => $data['review_notes'],
                    'status' => 'Resolved',
                    'reviewed_by' => $admin->id,
                ]);

                $content->update(['status' => 'Block']);
                $user->increment('acc_violation_count');
                $user->notify(new SendNotification($admin, $notificationMap[$contentType], $content->title ?? $content->name ?? $content->content));

                $this->blockUser($user, $request->acc_block_until, $admin, $report, $labelMap[$contentType]);
            } else {
                $report->update([
                    'review_notes' => $data['review_notes'],
                    'status' => 'Rejected',
                    'reviewed_by' => $admin->id,
                ]);
            }

            AdminLogs::create([
                'admin_id' => $admin->id,
                'action' => "Report {$contentType}",
                'details' => "{$admin->name} {$report->status} report. ID: {$report->content_id}",
            ]);
        });

        return back()->with('success', 'Report handled successfully!');
    }

    //delete report
    public function deleteReport($reportId){
        $admin = auth('admin')->user();

        //delete
        $report=Report::findOrFail($reportId);
        $report->delete();

        //insert admin logs
        $adminLog=AdminLogs::create([
            'admin_id'=> $admin->id,
            'action' => "Delete Report ",
            'details'=> $admin->name.' delete report. Report ID : '.$report->id,
        ]);
        return back()->with('success', 'Report delete successfully!');
    }
    
}
