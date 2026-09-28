// const BASE_URL = "https://jsonplaceholder.typicode.com";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api"

export const fetchInstance = async (endpoint, options = {}) => {
  const headers = {
    ...options.headers,
  };

  // Don't set Content-Type for FormData.
  // The browser will automatically set multipart/form-data with the boundary.
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Something went wrong");
  }

  return res.json();
};

export const completeOnboarding = async (authUser) => {

  const response = await fetchInstance("/auth/onBoarding", {
    method: "POST",
    body: JSON.stringify(authUser),
  });

  return response.user
}

export const getUserFriends = async () => {

  const response = await fetchInstance("/user/friends", {
    method: "GET",
  });

  return response.friends
}

export const getRecommendedUsers = async () => {

  const response = await fetchInstance("/user/recommended", {
    method: "GET",
  });

  return response.users
}

export const getExploreUsers = async (filters) => {
  const params = new URLSearchParams();

  if (filters.native) {
    params.append("native", filters.native);
  }

  if (filters.learning) {
    params.append("learning", filters.learning);
  }

  if (filters.location) {
    params.append("location", filters.location);
  }

  const response = await fetchInstance(
    `/user/explore?${params.toString()}`,
    {
      method: "GET",
    }
  );

  return response.users;
};

export const getOutgoingFriendReqs = async () => {

  const response = await fetchInstance("/user/outgoing-friend-requests", {
    method: "GET",
  });

  return response
}

export async function sendFriendRequest(userId) {
  const response = await fetchInstance(`/user/friend-request/${userId}`, {
    method: "POST"
  });

  return response;
}

export async function getFriendRequests() {
  const response = await fetchInstance("/user/friend-requests", {
    method: 'GET'
  });
  return response;
}

export async function acceptFriendRequest(requestId) {
  const response = await fetchInstance(`/user/friend-request/${requestId}/accept`, {
    method: 'PUT'
  });
  return response;
}

export async function getStreamToken() {
  const response = await fetchInstance(`/chat/token/`, {
    method: 'GET'
  });
  return response;
}

export async function getUserById({ id }) {
  const response = await fetchInstance(`/user/${id}`, {
    method: 'GET'
  });
  console.log({ id })
  return response;
}


// ------ai -------------

export const translateMessage = (body) =>
  fetchInstance("/ai/translate", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const improveMessage = (body) =>
  fetchInstance("/ai/improve", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const friendlyMessage = (body) =>
  fetchInstance("/ai/friendly", {
    method: "POST",
    body: JSON.stringify(body)
  });

export const formalMessage = (body) =>
  fetchInstance("/ai/formal", {
    method: "POST",
    body: JSON.stringify(body)
  });

// ----- agents ------------

export const createAgent = async (agentData) => {
  const res = await fetchInstance("/agents", {
    method: "POST",
    body: JSON.stringify(agentData),
  });

  return res;
};


export const getAgents = async () => {
  const res = await fetchInstance("/agents", {
    method: "GET",
  });

  console.log("GET AGENTS RESPONSE:", res);

  return res.agents;
};

export const deleteAgent = async (agentId) => {
  const response = await fetchInstance(`/agents/${agentId}`, {
    method: "DELETE",
  });

  return response;
};

// ---------- Agent Chat ----------

// export const sendAgentMessage = async (
//     agentId,
//     message,
//     conversationId
// ) => {
//     return await fetchInstance(
//         `/agents/${agentId}/chat`,
//         {
//             method: "POST",
//             body: JSON.stringify({
//                 message,
//                 conversationId,
//             }),
//         }
//     );
// };

export const getAgentConversation = async (agentId) => {
  return await fetchInstance(
    `/agents/${agentId}/chat`,
    {
      method: "GET",
    }
  );
};