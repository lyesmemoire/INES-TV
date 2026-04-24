import { useEffect, useState } from "react";
import { fetchHomeFeed } from "../services/feed";
import { useAuth } from "../context/AuthContext";

export function useFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const data = await fetchHomeFeed(user.id);
      setFeed(data);
      setLoading(false);
    };

    load();
  }, [user]);

  return { feed, loading };
}
