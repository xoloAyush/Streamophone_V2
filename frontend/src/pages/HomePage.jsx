import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect, useState } from "react";
import { LANGUAGES } from '../constants/index'

import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getExploreUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitialize } from "../lib/utils";
import { useMemo } from "react";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import toast from "react-hot-toast";

import { useState } from "react";



const HomePage = () => {

  const [filters, setFilters] = useState({
  native: "",
  learning: "",
  location: "",
});

const hasActiveFilters =
  filters.native || filters.learning || filters.location;

  const getStars = (score) => {
  if (score >= 90) return "⭐⭐⭐⭐⭐";
  if (score >= 70) return "⭐⭐⭐⭐☆";
  if (score >= 50) return "⭐⭐⭐☆☆";
  if (score >= 30) return "⭐⭐☆☆☆";
  if (score > 0) return "⭐☆☆☆☆";
  return "";
};

  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    // staleTime: 1000 * 60 * 30,
  // refetchOnWindowFocus: false,
  // refetchOnReconnect: false,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  //   staleTime: 1000 * 30,
  // refetchOnWindowFocus: false,
  // refetchOnReconnect: false,
  });

   const {
  data: exploreUsers = [],
  isLoading: loadingExplore,
} = useQuery({
  queryKey: ["exploreUsers", filters],
  queryFn: () => getExploreUsers(filters),
  enabled:
    !!filters.native ||
    !!filters.learning ||
    !!filters.location,
});

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  //   staleTime: 1000 * 30 ,
  // refetchOnWindowFocus: false,
  // refetchOnReconnect: false,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {

      toast.success("Request sent ");

      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    }
  });

  const outgoingRequestsIds = useMemo(() => {
  return new Set(
    (outgoingFriendReqs ?? []).map((req) => req.recipient._id)
  );
}, [outgoingFriendReqs]);

  // useEffect(() => {
  //   const outgoingIds = new Set();
  //   if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
  //     outgoingFriendReqs.forEach((req) => {
  //       outgoingIds.add(req.recipient._id);
  //     });
  //     setOutgoingRequestsIds(outgoingIds);
  //   }
  // }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="flex items-center p-3 border rounded-xs  relative group z-2 overflow-hidden hover:text-base-300">
          <div className="absolute inset-y-0 right-[103%] w-full bg-primary transition-all duration-500 group-hover:right-0 -z-10"></div>
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                // console.log(user);
                
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    {/* <h1>{user?.location}</h1> */}

                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full overflow-hidden flex flex-shrink-0">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                          <h3 className="font-light text-primary opacity-70">
  {user.matchScore > 0 && (
    <>
      {getStars(user.matchScore)} {user.matchScore}% Match
    </>
  )}
</h3>
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.reasons.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-2">
    {user.reasons.map((reason, index) => (
      <span
        key={index}
        className="badge badge-success badge-outline text-xs"
      >
        {reason}
      </span>
    ))}
  </div>
)}

                      {user.bio && <p className="text-sm opacity-70">{user.bio.length > 100 ? `${user.bio.slice(0, 100)}...` : user.bio}
                        </p>}

                      {/* Action button */}
                      <button
                        className={` w-full mt-2  flex items-center text-center justify-center p-2 rounded-xl font-bold ${
                          hasRequestBeenSent ? "btn-disabled" : "bg-primary hover:bg-neutral text-base-100 hover:text-primary cursor-pointer hover:border-primary border transition-all"
                        } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <div className=" flex items-center ">
                            <UserPlusIcon className="size-4 mr-2 " />
                            Send Friend Request
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

       <section className="mt-16">
  <div className="mb-8">
    <h2 className="text-3xl font-bold">Explore People</h2>

    <p className="opacity-70 mb-6">
      Find language partners using filters.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Native Language */}
      <select
        className="select select-bordered w-full"
        value={filters.native}
        onChange={(e) =>
          setFilters({
            ...filters,
            native: e.target.value,
          })
        }
      >
        <option value="">All Native Languages</option>

        {LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>

      {/* Learning Language */}
      <select
        className="select select-bordered w-full"
        value={filters.learning}
        onChange={(e) =>
          setFilters({
            ...filters,
            learning: e.target.value,
          })
        }
      >
        <option value="">All Learning Languages</option>

        {LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>

      {/* Location */}
      <input
        type="text"
        placeholder="Location"
        className="input input-bordered w-full"
        value={filters.location}
        onChange={(e) =>
          setFilters({
            ...filters,
            location: e.target.value,
          })
        }
      />
    </div>
  </div>

  {!hasActiveFilters ? (
    <div className="card bg-base-200 p-8 text-center">
      <h3 className="font-semibold text-lg">
        Start exploring people
      </h3>

      <p className="opacity-70 mt-2">
        Select a language or enter a location to find people.
      </p>
    </div>
  ) : loadingExplore ? (
    <div className="flex justify-center py-12">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  ) : exploreUsers.length === 0 ? (
    <div className="card bg-base-200 p-8 text-center">
      <h3 className="font-semibold text-lg">
        No users found
      </h3>

      <p className="opacity-70">
        Try changing your filters.
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exploreUsers.map((user) => {
        const hasRequestBeenSent =
          outgoingRequestsIds.has(user._id);

        return (
          <div
            key={user._id}
            className="card bg-base-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-16 rounded-full">
                    <img
                      src={user.profilePic}
                      alt={user.fullName}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">
                    {user.fullName}
                  </h3>

                  <p className="text-xs opacity-70 flex items-center gap-1">
                    <MapPinIcon size={14} />
                    {user.location}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="badge badge-secondary">
                  {getLanguageFlag(user.nativeLanguage)}
                  Native: {capitialize(user.nativeLanguage)}
                </span>

                <span className="badge badge-outline">
                  {getLanguageFlag(user.learningLanguage)}
                  Learning: {capitialize(user.learningLanguage)}
                </span>
              </div>

              {user.bio && (
                <p className="text-sm opacity-70">
                  {user.bio}
                </p>
              )}

              <button
                className={`w-full mt-2  flex items-center text-center justify-center p-2 rounded-xl font-bold ${
                          hasRequestBeenSent ? "btn-disabled" : "bg-primary hover:bg-neutral text-base-100 hover:text-primary cursor-pointer hover:border-primary border transition-all"
                }`}
                disabled={hasRequestBeenSent || isPending}
                onClick={() => sendRequestMutation(user._id)}
              >
                {hasRequestBeenSent ? (
                  <>
                    <CheckCircleIcon className="size-4 mr-2" />
                    Request Sent
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="size-4 mr-2" />
                    Send Friend Request
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>
      </div>
    </div>
  );
};

export default HomePage;