import { Link } from "react-router";
import {
  BotIcon,
  MessageCircleIcon,
  TargetIcon,
  Settings,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAgent } from "../lib/api";

const AgentCard = ({ agent }) => {
  const [setting, setSetting] = useState(false);

  const queryClient = useQueryClient();

  const deleteAgentMutation = useMutation({
    mutationFn: deleteAgent,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agents"],
      });

      setSetting(false);
    },

    onError: (error) => {
      console.error("Delete agent error:", error);
    },
  });

  const truncateText = (text, maxLength = 35) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + "...";
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${agent.name}"?`
    );

    if (!confirmed) return;

    deleteAgentMutation.mutate(agent._id);
  };

  return (
    <div className="card bg-base-200 hover:shadow-lg transition-shadow">
      <div className="card-body p-5">

        {/* Agent header */}
        <div className="flex justify-between gap-3 mb-4">

          <div className="flex items-center gap-3">

            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12 flex justify-center items-center">
                <BotIcon className="size-6 mx-auto" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg">
                {agent.name}
              </h3>

              <p className="text-xs opacity-60">
                {agent.language} • {agent.tone}
              </p>
            </div>

          </div>


          {/* Settings */}
          <div className="relative">

            <button
              type="button"
              onClick={() => setSetting((prev) => !prev)}
              className="btn btn-ghost btn-sm btn-square"
            >
              <Settings className="size-5" />
            </button>


            {/* Dropdown */}
            {setting && (
              <div
                className="
                  absolute
                  right-0
                  top-10
                  z-50
                  w-44
                  rounded-xl
                  bg-base-100
                  border
                  border-base-300
                  shadow-xl
                  p-1
                "
              >

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteAgentMutation.isPending}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    rounded-lg
                    text-error
                    hover:bg-error
                    hover:text-error-content
                    transition-colors
                    text-sm
                  "
                >
                  <Trash2Icon className="size-4" />

                  {deleteAgentMutation.isPending
                    ? "Deleting..."
                    : "Delete Agent"}
                </button>

              </div>
            )}

          </div>

        </div>


        {/* Objective */}
        <div className="mb-4">

          <div className="flex items-center gap-2 text-sm font-semibold mb-1">
            <TargetIcon className="size-4" />
            Objective
          </div>

          <p className="text-sm opacity-80 line-clamp-2">
            {agent.objective}
          </p>

        </div>


        {/* Behaviors */}
        {agent.behavior?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">

            {agent.behavior.slice(0, 3).map((behavior, index) => (
              <span
                key={index}
                className="badge badge-outline text-xs max-w-full overflow-hidden"
                title={behavior}
              >
                {truncateText(behavior, 35)}
              </span>
            ))}

            {agent.behavior.length > 3 && (
              <span className="badge badge-ghost text-xs">
                +{agent.behavior.length - 3} more
              </span>
            )}

          </div>
        )}


        {/* Actions */}
        <div className="flex gap-2 mt-auto">

          <Link
            to={`/agents/${agent._id}/chat`}
            className="btn btn-primary flex-1"
          >
            <MessageCircleIcon className="size-4" />
            Chat
          </Link>

        </div>

      </div>
    </div>
  );
};

export default AgentCard;