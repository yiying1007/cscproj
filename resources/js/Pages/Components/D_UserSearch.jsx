import { useState } from "react";
import { usePage } from "@inertiajs/react";



function UserSearch() {
    const {users} = usePage().props;
    const [query, setQuery] = useState(""); // 搜索框输入内容
    const [filteredUsers, setFilteredUsers] = useState(users); // 过滤后的好友列表

    // 处理输入框的变化
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setQuery(value);

        // 根据输入内容实时过滤好友列表
        const filtered = users.filter((user) =>
            user.name.toLowerCase().includes(value)
        );
        setFilteredUsers(filtered);
    };

    return (
        <div>
            {/* 搜索输入框 */}
            <input
                type="text"
                placeholder="Search Users..."
                value={query}
                onChange={handleSearch}
            />

            {/* 好友列表 */}
            <ul>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <li key={user.id}>{user.nickname}</li>
                    ))
                ) : (
                    <li>No friends found.</li>
                )}
            </ul>
        </div>
    );
}

export default UserSearch;
