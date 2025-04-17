import { useState } from "react";
import { usePage, router, Link } from "@inertiajs/react";

function UserList() {
  const { users: initialUsers, auth } = usePage().props;

  const [users, setUsers] = useState(initialUsers); // 管理分页数据
  const [loading, setLoading] = useState(false);

  // next page without refresh page
  const handlePageChange = (url) => {
    if (!url) return;
    setLoading(true);

    router.get(
      url,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        // update only users data
        only: ["users"], 
        onSuccess: (page) => {
          setUsers(page.props.users); 
          setLoading(false);
        },
      }
    );
  };

  // filter current user
  const filteredUsers = users.data.filter((user) => user.id !== auth.user.id);

  return (
    <div>
      <h3>All Users</h3>
      {loading ? (
        <div>Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="box-style">
          <h5 className='info-message'>No Users</h5>
        </div>
      ) : (
        filteredUsers.map((user) => {
          const userAvatarUrl = `https://fypcscproject.s3.ap-southeast-1.amazonaws.com/${user.avatar}`;

          return (
            <div key={user.id}>
              <Link
                className="box-style"
                href={route("user.targetUserProfile", user)}
              >
                <div className="box-info-left">
                  <img src={userAvatarUrl} className="avatarMedium" alt="Avatar" />
                </div>
                <div className="box-info-center">
                  <h5>{user.nickname}</h5>
                  <p>{user.position}</p>
                </div>
              </Link>
            </div>
          );
        })
      )}
      
      <div className="pagination" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        {users.links.map((link, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(link.url)}
            disabled={!link.url}
            style={{
              padding: "5px 10px",
              backgroundColor: link.active ? "#000000" : "#f8f9fa",
              color: link.active ? "white" : "black",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
              cursor: link.url ? "pointer" : "not-allowed",
              opacity: link.url ? 1 : 0.6,
            }}
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        ))}
      </div>
    </div>
  );
}

export default UserList;
