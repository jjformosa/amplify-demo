import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export const useCurrentUrl = () => {
  const location = useLocation();
  
  // Get query string without the leading '?'
  const queryString = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.toString();
  }, [location.search]);

  // Parse query string into key-value object
  const query = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryObject:{ [key:string]: string} = {};
    searchParams.forEach((value, key) => {
      queryObject[key] = value;
    });
    return queryObject;
  }, [location.search]);

  // Get hash without the leading '#'
  const hashPart = useMemo(() => {
    return location.hash.slice(1);
  }, [location.hash]);

  // Get full path including search and hash
  const fullPath = useMemo(() => {
    return `${location.pathname}${location.search}${location.hash}`;
  }, [location.pathname, location.search, location.hash]);

  // Get current host information
  const host = useMemo(() => {
    const protocol = window.location.protocol;
    const hostname = window.location.host;
    return `${protocol}//${hostname}`;
  }, []);

  // Get full URL
  const fullUrl = useMemo(() => {
    return `${host}${fullPath}`;
  }, [host, fullPath]);

  // Return all URL information as an object
  return {
    /**
     * 應用程式目前的路徑,i.e.vue-router目前match到的路徑
     */
    fullPath,
    
    /**
     * 目前網址上queryString的部分
     */
    queryString,
    
    /**
     * 目前網址上query的key-value
     */
    query,
    
    /**
     * 目前網址上hash的部分
     */
    hashPart,
    
    /**
     * 目前網址的完整路徑
     */
    fullUrl,
    
    /**
     * 目前網址的host
     */
    host,
  };
};