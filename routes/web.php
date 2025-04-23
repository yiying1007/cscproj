<?php

//use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CampusVerificationController;
use App\Http\Controllers\UserManageController;
use App\Http\Controllers\AdminLogsManagementController;
use App\Http\Controllers\AdminManageController;
use App\Http\Controllers\UserIdentityManageController;
use App\Http\Controllers\FriendshipsController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\CommunitiesManageController;
use App\Http\Controllers\CommunitiesController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\PostTypeController;
use App\Http\Controllers\ReportManageController;
use App\Http\Controllers\PostManageController;
use App\Http\Controllers\AnnouncementsManageController;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ChatManagementController;
use App\Http\Controllers\WordSensitiveController;

Route::middleware('verifiedUser')->group(function () {
    Route::get('/', fn() => Inertia::render('User/Welcome'))->name('user.welcome');
});
Route::prefix('User')->middleware('verifiedUser')->group(function () {
    Route::get('/Login', [UserController::class, 'showLoginComponent'])->name('user.login');
    Route::post('/Login', [UserController::class, 'accountLogin']);
    Route::get('/Register', [UserController::class, 'showRegisterComponent'])->name('user.register');
    Route::post('/Register', [UserController::class, 'accountRegister']);
    Route::get('/ForgotPassword', [UserController::class, 'showForgotPasswordComponent'])->name('user.forgotPassword');
    Route::post('/ForgotPassword', [UserController::class, 'generateVerifyCode']);
    Route::get('/PasswordReset', [UserController::class, 'showPasswordResetComponent'])->name('user.passwordReset');
    Route::post('/PasswordReset', [UserController::class, 'passwordReset']);
    
});

Route::prefix('Admin')->middleware('verifiedAdmin')->group(function () {
    Route::get('/Login', [AdminController::class, 'showLoginComponent'])->name('admin.login');
    Route::post('/Login', [AdminController::class, 'accountLogin']);
});

Route::prefix('User')->middleware('auth', 'verified')->group(function () {
    //Route::get('/Index', [PostsController::class, 'showIndexPostsComponent'])->name('user.index');
    Route::get('/loadPartialPosts', [PostsController::class, 'loadMorePosts']);
    Route::get('/loadPublicPosts', [PostsController::class, 'loadMorePosts']);
    Route::get('/accountLogout', [UserController::class, 'accountLogout'])->name('user.logout')->withoutMiddleware('verified');
    
    // home
    Route::get('/Index', [IndexController::class, 'showIndexComponent'])->name('user.index');
    Route::get('/AnnouncementDetail/{announcement}', [IndexController::class, 'showAnnouncementDetailComponent'])->name('user.announcementDetail');
    Route::get('/loadHomePosts', [IndexController::class, 'loadMorePosts']);
    // profile
    Route::get('/Profile', [UserController::class, 'showProfileComponent'])->name('user.profile');
    Route::get('/loadMyPosts', [UserController::class, 'loadMorePosts']);
    Route::get('/ProfileEdit', [UserController::class, 'showProfileEditComponent'])->name('user.profileEdit');
    Route::post('/ProfileEdit', [UserController::class, 'profileEdit']);
    Route::post('/AvatarEdit', [UserController::class, 'avatarEdit'])->name('user.avatarEdit');
    Route::get('/ResetPassword', [UserController::class, 'showResetPasswordComponent'])->name('user.resetPassword');
    Route::post('/ResetPassword', [UserController::class, 'resetPassword']);

    //identity verificationverification
    Route::get('/IdentityVerification', [CampusVerificationController::class, 'showIdentityVerificationComponent'])->name('user.identityVerification')->withoutMiddleware('verified');
    Route::post('/IdentityVerification/SendCode', [CampusVerificationController::class, 'generateVerifyCode'])->name('user.generateVerifyCode')->withoutMiddleware('verified');
    Route::post('/IdentityVerification/Verify', [CampusVerificationController::class, 'identityAuthentication'])->name('user.identityAuthentication')->withoutMiddleware('verified');
    Route::get('/PersonalVerificationCard/{id}', [CampusVerificationController::class, 'showVerificationCardComponent'])->name('user.verifyCard');

    // friend
    Route::get('/UserList', [FriendshipsController::class, 'showUserListComponent'])->name('user.userList');
    Route::get('/UserList/loadFriends', [FriendshipsController::class, 'loadMoreFriends']);
    Route::get('/UserList/TargetUserProfile/{user}', [FriendshipsController::class, 'showTargetUserProfileComponent'])->name('user.targetUserProfile');
    Route::get('/UserList/TargetUserProfile/loadTargerUserPosts/{user}', [FriendshipsController::class, 'loadMorePosts']);
    Route::post('/UserList/TargetUserProfile/Send/{targetUserId}', [FriendshipsController::class, 'sendFriendRequest'])->name('user.sendFriendRequest');
    Route::post('/UserList/Accept/{id}', [FriendshipsController::class, 'acceptFriendRequest'])->name('user.acceptFriendRequest');
    Route::delete('/UserList/Reject/{id}', [FriendshipsController::class, 'rejectFriendRequest'])->name('user.rejectFriendRequest');
    Route::delete('/UserList/TargetUserProfile/Delete/{id}', [FriendshipsController::class, 'deleteTargetFriend'])->name('user.deleteTargetFriend');

    // notification
    Route::get('/api/Notifications', [NotificationsController::class, 'showNotificationComponent'])->name('user.notifications')->withoutMiddleware('verified');
    Route::post('/Notifications/Read', [NotificationsController::class, 'markAsRead'])->name('user.markAsRead');
    Route::delete('/Notifications/Clear', [NotificationsController::class, 'clearAll'])->name('user.clearAllNotice');

    //search
    Route::get('/Search', [SearchController::class, 'search'])->name('user.search');

    //community
    Route::get('/Communities', [CommunitiesController::class, 'showCommunitiesComponent'])->name('user.communities');
    Route::get('/loadCommunities', [CommunitiesController::class, 'loadMoreCommunities']);
    Route::get('/Communities/Profile/{community}', [CommunitiesController::class, 'showCommunityProfileComponent'])->name('user.communityProfile');
    Route::get('/Communities/Profile/loadCommunityPosts/{community}', [CommunitiesController::class, 'loadMorePosts']);
    Route::post('/Communities/Profile/ReportCommunity/{community}', [CommunitiesController::class, 'reportCommunity'])->name('user.reportCommunity');
    Route::post('/Communities/Profile/Join/{community}', [CommunitiesController::class, 'joinCommunity'])->name('user.joinCommunity');
    Route::delete('/Communities/Profile/Exit/{community}', [CommunitiesController::class, 'exitCommunity'])->name('user.exitCommunity');
    Route::delete('/Communities/Profile/Delete/{community}', [CommunitiesController::class, 'deleteCommunity'])->name('user.deleteCommunity');
    Route::post('/Communities/Profile/Send/{community}', [CommunitiesController::class, 'sendCommunityRequest'])->name('user.sendCommunityRequest');
    //Route::get('/Communities/Profile/Edit/{community}', [CommunitiesController::class, 'showCommunityEditComponent'])->name('user.showEditCommunity');
    Route::post('/Communities/Profile/Edit/{community}', [CommunitiesController::class, 'editCommunity'])->name('user.editCommunity');
    Route::post('/Communities/Profile/EditAvatar/{community}', [CommunitiesController::class, 'communityAvatarEdit'])->name('user.communityAvatarEdit');
    Route::post('/Communities/Create', [CommunitiesController::class, 'createCommunity'])->name('user.createCommunity');

    //community member
    //Route::get('/Communities/Profile/Member/{community}', [CommunitiesController::class, 'showCommunityMemberComponent'])->name('user.communityMember');
    Route::get('/Communities/Profile/Member/loadMembers/{community}', [CommunitiesController::class, 'loadMoreCommunityMembers'])->name('user.loadMoreCommunityMembers');
    Route::post('/Communities/Profile/Member/Accept/{memberId}/{communityId}', [CommunitiesController::class, 'acceptMemberRequest'])->name('user.acceptMemberRequest');
    Route::delete('/Communities/Profile/Member/Reject/{memberId}/{communityId}', [CommunitiesController::class, 'rejectMemberRequest'])->name('user.rejectMemberRequest');
    Route::post('/Communities/Profile/Member/InviteMember/{userId}/{communityId}', [CommunitiesController::class, 'inviteMember'])->name('user.inviteMember');
    Route::delete('/Communities/Profile/Member/Delete/{memberId}/{communityId}', [CommunitiesController::class, 'deleteCommunityMember'])->name('user.deleteCommunityMember');
    Route::post('/Communities/Profile/Member/SetToAdmin/{memberId}/{communityId}', [CommunitiesController::class, 'setMemberToAdmin'])->name('user.setMemberToAdmin');
    Route::post('/Communities/Profile/Member/SetToMember/{memberId}/{communityId}', [CommunitiesController::class, 'setAdminToMember'])->name('user.setAdminToMember');
    Route::post('/Communities/Profile/Member/SetToLeader/{memberId}/{communityId}', [CommunitiesController::class, 'setToLeader'])->name('user.setToLeader');

    // post
    Route::post('/CreatePost', [PostsController::class, 'createPost'])->name('user.createPost');
    Route::delete('/DeletePost/{postId}', [PostsController::class, 'deletePost'])->name('user.deletePost');
    Route::delete('/DeleteDetailPost/{postId}', [PostsController::class, 'deleteDetailPost'])->name('user.deleteDetailPost');
    Route::post('/ChangeVisibility/{postId}', [PostsController::class, 'changeVisibility'])->name('user.changeVisibility');
    Route::post('/ReportPost/{postId}', [PostsController::class, 'reportPost'])->name('user.reportPost');
    Route::get('/Post/DetailPost/{post}', [PostsController::class, 'showPostDetailComponent'])->name('user.postDetail');
    Route::post('/PostLike/{postId}', [PostsController::class, 'likePost'])->name('user.likePost');

    // comment 
    Route::post('/CreateComment', [PostsController::class, 'createComment'])->name('user.createComment');
    Route::get('/Post/DetailPost/loadMoreComments/{post}', [PostsController::class, 'loadMoreComments']);
    Route::delete('/DeleteComment/{commentId}', [PostsController::class, 'deleteComment'])->name('user.deleteComment');
    Route::post('/ReportComment/{commentId}', [PostsController::class, 'reportComment'])->name('user.reportComment');
    Route::post('/CommentLike/{commentId}/{postId}', [PostsController::class, 'likeComment'])->name('user.likeComment');

    //chat
    Route::get('/Chat', [ChatController::class, 'showChatComponent'])->name('user.chat');
    Route::get('/loadChats', [ChatController::class, 'loadMoreChats']);
    Route::get('/ChatMessage/{chatId}', [ChatController::class, 'showMessageComponent'])->name('user.showMessage');
    Route::post('/ChatMessage/AsRead', [ChatController::class, 'markAsRead']);
    Route::post('/SendMessage', [ChatController::class, 'sendMessage'])->name('user.sendMessage');
    Route::delete('/DeleteMessage/{messageId}', [ChatController::class, 'deleteMessage'])->name('user.deleteMessage');
    Route::post('/DeleteChat/{chatId}', [ChatController::class, 'deleteChat'])->name('user.deleteChat');
    Route::post('/DeleteHistoryMessage/{chatId}', [ChatController::class, 'deleteHistoryMessage'])->name('user.deleteHistoryMessage');
    Route::post('/CreateChat/{user_id}', [ChatController::class, 'createChat'])->name('user.createChat');
    Route::get('/api/UnreadMessageNotice', [ChatController::class, 'showUnreadMessageNotice'])->name('user.unreadMessageNotice')->withoutMiddleware('verified');
    Route::post('/ChatMessage/ReportMessage/{messageId}', [ChatController::class, 'reportMessage'])->name('user.reportChat');
});

Route::prefix('Admin')->middleware('admin')->group(function () {
    Route::get('/Dashboard',[DashboardController::class,'showDashboardComponent'])->name('admin.dashboard');
    Route::get('/accountLogout', [AdminController::class, 'accountLogout'])->name('admin.logout');
    // user Management
    Route::get('/UserManagement', [UserManageController::class, 'showUserManagementComponent'])->name('admin.userManagement');
    Route::post('/UserManagement/Create', [UserManageController::class, 'createUser'])->name('admin.createUser');
    Route::post('/UserManagement/Edit/{id}', [UserManageController::class, 'editUser'])->name('admin.editUser');
    Route::post('/UserManagement/EditAvatar/{id}', [UserManageController::class, 'editUserAvatar'])->name('admin.editUserAvatar');
    Route::delete('/UserManagement/Delete/{id}', [UserManageController::class, 'deleteUser'])->name('admin.deleteUser');
    
    // admin logs management
    Route::get('/AdminLogsManagement', [AdminLogsManagementController::class, 'showAdminLogsManagementComponent'])->name('admin.adminLogsManagement');
    Route::delete('/AdminLogsManagement/Delete/{id}', [AdminLogsManagementController::class, 'deleteAdminLogs'])->name('admin.deleteAdminLogs');
    
    // admin management
    Route::get('/AdminManagement', [AdminManageController::class, 'showAdminManagementComponent'])->name('admin.adminManagement');
    Route::post('/AdminManagement/EditAvatar/{id}', [AdminManageController::class, 'editAdminAvatar'])->name('admin.editAdminAvatar');
    Route::post('/AdminManagement/Create', [AdminManageController::class, 'createAdmin'])->name('admin.createAdmin');
    Route::post('/AdminManagement/Edit/{id}', [AdminManageController::class, 'editAdmin'])->name('admin.editAdmin');
    Route::delete('/AdminManagement/Delete/{id}', [AdminManageController::class, 'deleteAdmin'])->name('admin.deleteAdmin');

    // user identity management
    Route::get('/UserIdentityManagement', [UserIdentityManageController::class, 'showUserIdentityManagementComponent'])->name('admin.userIdentityManagement');
    Route::post('/UserIdentityManagement/Create', [UserIdentityManageController::class, 'createUserIdentity'])->name('admin.createUserIdentity');
    Route::post('/UserIdentityManagement/Edit/{id}', [UserIdentityManageController::class, 'editUserIdentity'])->name('admin.editUserIdentity');
    Route::delete('/UserIdentityManagement/Delete/{id}', [UserIdentityManageController::class, 'deleteUserIdentity'])->name('admin.deleteUserIdentity');
    
    // communities management
    Route::get('/CommunitiesManagement', [CommunitiesManageController::class, 'showCommunitiesManagementComponent'])->name('admin.communitiesManagement');
    Route::get('/LoadMoreUsers', [CommunitiesManageController::class, 'loadMoreUsers']);
    Route::post('/CommunitiesManagement/Create', [CommunitiesManageController::class, 'createCommunity'])->name('admin.createCommunity');
    Route::post('/CommunitiesManagement/EditAvatar/{id}', [CommunitiesManageController::class, 'editCommunityAvatar'])->name('admin.editCommunityAvatar');
    Route::post('/CommunitiesManagement/Edit/{id}', [CommunitiesManageController::class, 'editCommunity'])->name('admin.editCommunity');
    Route::delete('/CommunitiesManagement/Delete/{id}', [CommunitiesManageController::class, 'deleteCommunity'])->name('admin.deleteCommunity');
    Route::post('/CommunitiesManagement/BlockCommunity/{id}', [CommunitiesManageController::class, 'blockCommunity'])->name('admin.blockCommunity');
    
    // members management
    Route::get('/CommunitiesManagement/{communityId}/Member', [CommunitiesManageController::class, 'showMemberManagementComponent'])->name('admin.memberManagement');
    Route::delete('/CommunitiesManagement/DeleteMember/{memberId}/{communityId}', [CommunitiesManageController::class, 'deleteMember'])->name('admin.deleteMember');
    Route::post('/CommunitiesManagement/SetToAdmin/{memberId}/{communityId}', [CommunitiesManageController::class, 'setMemberToAdmin'])->name('admin.setMemberToAdmin');
    Route::post('/CommunitiesManagement/SetToMember/{memberId}/{communityId}', [CommunitiesManageController::class, 'setAdminToMember'])->name('admin.setAdminToMember');
    Route::post('/CommunitiesManagement/SetToLeader/{memberId}/{communityId}', [CommunitiesManageController::class, 'setToLeader'])->name('admin.setToLeader');
    Route::post('/CommunitiesManagement/AddMember/{userId}/{communityId}', [CommunitiesManageController::class, 'addMember'])->name('admin.addMember');
    
    // post types management
    Route::get('/PostTypeManagement', [PostTypeController::class, 'showPostTypeManagementComponent'])->name('admin.postTypeManagement');
    Route::post('/PostTypeManagement/Create', [PostTypeController::class, 'createPostType'])->name('admin.createPostType');
    Route::post('/PostTypeManagement/Edit/{id}', [PostTypeController::class, 'editPostType'])->name('admin.editPostType');
    Route::delete('/PostTypeManagement/Delete/{id}', [PostTypeController::class, 'deletePostType'])->name('admin.deletePostType');

    //report management
    Route::get('/ReportPostManagement', [ReportManageController::class, 'showPostReportManagementComponent'])->name('admin.postReportManagement');
    Route::get('/ReportCommunityManagement', [ReportManageController::class, 'showCommunityReportManagementComponent'])->name('admin.communityReportManagement');
    Route::get('/ReportCommentManagement', [ReportManageController::class, 'showCommentReportManagementComponent'])->name('admin.commentReportManagement');
    Route::get('/ReportChatManagement', [ReportManageController::class, 'showChatReportManagementComponent'])->name('admin.chatReportManagement');
    Route::post('/ReportPostManagement/Report/{report}/{contentType}', [ReportManageController::class, 'handleReport'])->name('admin.handleReport');
    Route::delete('/ReportPostManagement/Delete/{report}', [ReportManageController::class, 'deleteReport'])->name('admin.deleteReport');
    
    //post management
    Route::get('/PostManagement', [PostManageController::class, 'showPostManagementComponent'])->name('admin.postManagement');
    Route::get('/PostManagement/{postId}/Comment', [PostManageController::class, 'showCommentManagementComponent'])->name('admin.commentManagement');
    Route::post('/PostManagement/BlockPost/{postId}', [PostManageController::class, 'blockPost'])->name('admin.blockPost');
    Route::post('/PostManagement/Comment/BlockComment/{commentId}', [PostManageController::class, 'blockComment'])->name('admin.blockComment');
    
    //announcement management
    Route::get('/AnnouncementManagement', [AnnouncementsManageController::class, 'showAnnouncementManagementComponent'])->name('admin.announcementManagement');
    Route::post('/AnnouncementManagement/Create', [AnnouncementsManageController::class, 'createAnnouncement'])->name('admin.createAnnouncement');
    Route::post('/AnnouncementManagement/Edit/{id}', [AnnouncementsManageController::class, 'editAnnouncement'])->name('admin.editAnnouncement');
    Route::delete('/AnnouncementManagement/Delete/{id}', [AnnouncementsManageController::class, 'deleteAnnouncement'])->name('admin.deleteAnnouncement');
});

/*
// 游客路由
Route::middleware('guest')->group(function () {
    Route::get('/', fn() => redirect()->route('user.login'))->name('home'); // 根路径重定向
    Route::get('/User/Login', [UserController::class, 'showLoginComponent'])->name('user.login');
    Route::post('/User/Login', [UserController::class, 'accountLogin']);
    Route::get('/User/Register', [UserController::class, 'showRegisterComponent'])->name('user.register');
    Route::post('/User/Register', [UserController::class, 'accountRegister']);
    Route::get('/Admin/Login', fn() => Inertia::render('Admin/Login'))->name('admin.login');
});

// 用户受保护路由
Route::middleware(['auth:user'])->group(function () {
    Route::get('/User/Index', fn() => Inertia::render('User/Index'))->name('user.index');
});

// 管理员受保护路由
Route::middleware('auth:admin')->group(function () {
    Route::get('/Admin/Dashboard', fn() => Inertia::render('Admin/Dashboard'))->name('admin.dashboard');
});
*/