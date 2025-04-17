import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";


//automatically load more items when the user scrolls to the bottom of the page
function useInfiniteScroll({ loadMore, hasMore }) {
    const { ref, inView } = useInView({ threshold: 0.5 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            setLoading(true);
            loadMore().finally(() => setLoading(false));
        }
    }, [inView, hasMore, loading, loadMore]);

    return { ref, loading };
}

export default useInfiniteScroll;
