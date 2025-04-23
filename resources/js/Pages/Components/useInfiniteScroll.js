import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";


//automatically load more items when the user scrolls to the bottom of the page
function useInfiniteScroll({ loadMore, hasMore }) {
    // load when scroll to bottom with 50% of the element in view
    const { ref, inView } = useInView({ threshold: 0.5 });
    const [loading, setLoading] = useState(false);
    //load item if have more item
    useEffect(() => {
        if (inView && hasMore && !loading) {
            setLoading(true);
            loadMore().finally(() => setLoading(false));
        }
    }, [inView, hasMore, loading, loadMore]);

    return { ref, loading };
}

export default useInfiniteScroll;
