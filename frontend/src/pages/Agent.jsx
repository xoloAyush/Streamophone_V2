import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";

import {
  createAgent,
  getAgents,
} from "../lib/api";

import AgentCard from "../components/AgentCard";


const Agent = () => {

  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    objective: "",
    language: "English",
    tone: "friendly",
    behavior: "",
    instructions: "",
  });


  // Get all agents
  const {
    data: agents = [],
    isLoading,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
  });


  // Create agent
  const createAgentMutation = useMutation({
    mutationFn: createAgent,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agents"],
      });

      setFormData({
        name: "",
        objective: "",
        language: "English",
        tone: "friendly",
        behavior: "",
        instructions: "",
      });

      setShowForm(false);
    },
  });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    const behaviorArray = formData.behavior
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    createAgentMutation.mutate({
      name: formData.name,
      objective: formData.objective,
      language: formData.language,
      tone: formData.tone,
      behavior: behaviorArray,
      instructions: formData.instructions,
    });
  };


  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Agents
        </h2>

        <button
          onClick={() => setShowForm(true)}
          className="
            flex items-center gap-2
            bg-primary
            text-primary-content
            rounded-xl
            px-4 py-2
            font-bold
            cursor-pointer
            hover:opacity-90
          "
        >
          <PlusIcon className="size-5" />
          Create Agent
        </button>

      </div>


      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" />
        </div>
      )}


      {/* No agents */}
      {!isLoading && agents.length === 0 && (
        <div className="text-center py-20 opacity-70">
          <p className="text-lg">
            You haven't created any agents yet.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="w-1/2 bg-primary mt-4 text-primary-content p-3 rounded-2xl font-bold cursor-pointer scale-95"
          >
            Create your first agent 
          </button>
        </div>
      )}


      {/* Agent cards */}
      {!isLoading && agents.length > 0 && (
        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-5
        ">
          {agents.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
            />
          ))}
        </div>
      )}


      {/* Create Agent Modal */}
      {showForm && (
        <div className="
          fixed inset-0
          z-50
          flex items-center justify-center
          bg-black/60
          p-4
        ">

          <div className="
            bg-base-100
            rounded-2xl
            w-full
            max-w-2xl
            max-h-[90vh]
            overflow-y-auto
            shadow-2xl
          ">

            {/* Modal header */}
            <div className="
              flex items-center justify-between
              p-6
              border-b
              border-base-300
            ">

              <h2 className="text-xl font-bold">
                Create Agent
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="bg-red-800 p-3 cursor-pointer rounded-2xl hover:bg-red-700"
              >
                <XIcon className="size-5" />
              </button>

            </div>


            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* Name */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Agent Name
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Friendly Korean Coach"
                  className="input input-bordered w-full"
                  required
                />
              </div>


              {/* Objective */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Objective
                  </span>
                </label>

                <textarea
                  name="objective"
                  value={formData.objective}
                  onChange={handleChange}
                  placeholder="Help users practice casual Korean"
                  className="textarea textarea-bordered w-full h-24"
                  required
                />
              </div>


              {/* Language + Tone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Language
                    </span>
                  </label>

                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    placeholder="Korean"
                    className="input input-bordered w-full"
                  />
                </div>


                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Tone
                    </span>
                  </label>

                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="friendly">
                      Friendly
                    </option>

                    <option value="professional">
                      Professional
                    </option>

                    <option value="casual">
                      Casual
                    </option>

                    <option value="formal">
                      Formal
                    </option>

                    <option value="supportive">
                      Supportive
                    </option>
                  </select>
                </div>

              </div>


              {/* Behaviors */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Behaviors
                  </span>
                </label>

                <textarea
                  name="behavior"
                  value={formData.behavior}
                  onChange={handleChange}
                  placeholder={
                    "Use simple vocabulary\nEncourage the learner\nAsk exactly one question per turn"
                  }
                  className="textarea textarea-bordered w-full h-32"
                />

                <p className="text-xs opacity-60 mt-1">
                  Enter one behavior per line.
                </p>
              </div>


              {/* Instructions */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Additional Instructions
                  </span>
                </label>

                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Keep the conversation relaxed..."
                  className="textarea textarea-bordered w-full h-28"
                />
              </div>


              {/* Error */}
              {createAgentMutation.isError && (
                <div className="alert alert-error">
                  {createAgentMutation.error.message}
                </div>
              )}


              {/* Submit */}
              <button
                type="submit"
                disabled={createAgentMutation.isPending}
                className="btn btn-primary w-full"
              >
                {createAgentMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Creating...
                  </>
                ) : (
                  "Create Agent"
                )}
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Agent;