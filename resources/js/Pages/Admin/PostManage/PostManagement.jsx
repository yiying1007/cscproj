import { AdminLayout } from '../../../../Layouts/ClientLayout';
import { usePage,Link } from '@inertiajs/react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import { PostDetailModal,BlockPostModal } from './PostDetailModal';


DataTable.use(DT);

function PostManagement(){

    const { posts } = usePage().props;
    
    return(
        <div>
            <AdminLayout>
            
            <div className="controlbar">
                <h5>Post Management </h5>
                
            </div>
            <div className="controlbox">
                <div className="container-fluid">
                    <DataTable id="datatable" className="table">
                        <thead>
                            <tr>
                            <th>No</th>
                            <th>Type</th>
                            <th>Title</th>
                            <th>Visibility</th>
                            <th>Status</th>
                            <th>Create Time</th>
                            <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post,index) => {
                        
                            return (
                                <tr key={post.id}>
                                <td>{index+1}</td>
                                <td>{post.type_name || "-"}</td>
                                <td>{post.title}</td>
                                <td>{post.is_private}</td>
                                {post.status==="Active"?(<td><span style={{color:"green",fontWeight:"500"}}>{post.status}</span></td>)
                                :(<td><span style={{color:"red",fontWeight:"500"}}>{post.status}</span></td>)
                                }
                                <td>{new Date(post.created_at).toLocaleString()}</td>
                                <td>
                                    <div className='actionStyle'>
                                        <PostDetailModal post={post} />
                                        <Link  className='btn btn-sm btnlink' href={route('admin.commentManagement',{postId: post.id} )} >
                                            Comment
                                        </Link>
                                        <BlockPostModal posts={post} />
                                    </div>
                                </td>
                                </tr>
                            );
                            })}
                        </tbody>
                    </DataTable>
                </div>
            </div>

            
            
            </AdminLayout>
            
        </div>

    );
}

export default PostManagement; 


