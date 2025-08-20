#!/bin/sh

# coding guidelines:
# - prefer branchless programming: use chain operators (&&, ||) instead of if-else for simple conditional logic
# - posix compliance: avoid bashisms, use portable shell constructs
# - use portable alternatives (printf over echo, standard tools over bashisms)
# - choose tools wisely: builtins for simple tasks, external tools when they add clear value
# - balance availability, performance, and appropriateness in tool selection

# statusline for claude code

read_json_input() {
  ### reads json from stdin or file, filtering comments
  ### args: ${1} optional file path (if provided, reads from file; otherwise stdin)
  ### returns: json content via stdout

    { [ ${#} -gt 0 ] && grep -v '^#' "${1}"; } || cat
}

parse_json_fields() {
  ### extracts fields from json input and captures for debugging
  ### args: ${1} json input string
  ### exports: model, full_cwd, style, transcript_path, version, session_cost, lines_added, lines_removed

    input="${1}"

    # helper function to extract json fields
    jqr() {
        printf '%s' "${input}" | jq -r "${1}"
    }

    session_id=$(jqr '.session_id // "unknown"')

    capture_file="/tmp/claude-statusline-${session_id}.json"
    printf "# json input captured on %s\n" "$(date)" > "${capture_file}"
    printf "%s\n" "${input}" >> "${capture_file}"

    model=$(jqr '.model.id // "claude"' | sed 's/^claude-//')
    full_cwd=$(jqr '.workspace.current_dir // .cwd // ""')
    style=$(jqr '.output_style.name // "default"')
    transcript_path=$(jqr '.transcript_path // ""')
    version=$(jqr '.version // ""')
    session_cost=$(jqr '.cost.total_cost_usd // 0')
    lines_added=$(jqr '.cost.total_lines_added // 0')
    lines_removed=$(jqr '.cost.total_lines_removed // 0')

    export model full_cwd style transcript_path version session_cost lines_added lines_removed
}

get_display_path() {
  ### formats path for display (git-aware, home-relative, or truncated)
  ### args: ${1} full directory path
  ### returns: formatted display path via stdout

    path="${1}"

    { cd "${path}" 2>/dev/null; } || {
        printf "%s\n" "${path}"
        return
    }

    { git rev-parse --git-dir >/dev/null 2>&1; } && {
        repo_root=$(git rev-parse --show-toplevel 2>/dev/null)
        { [ -n "${repo_root}" ]; } && {
            repo_name=$(basename "${repo_root}")

            rel_path=$(printf "%s" "${path}" | sed "s|^${repo_root}/*||")
            { [ -z "${rel_path}" ]; } && rel_path="."

            { [ "${rel_path}" = "." ] && printf "%s\n" "${repo_name}"; } || printf "%s/%s\n" "${repo_name}" "${rel_path}"
            return
        }
    }

    { [ -n "${HOME}" ]; } && {
        case "${path}" in "${HOME}"*)
            shortened=$(printf "%s" "${path}" | sed "s|^${HOME}||")
            { [ -z "${shortened}" ] && printf "~\n"; } || printf "~%s\n" "${shortened}"
            return
            ;;
        esac
    }

    printf "%s\n" "${path}" | awk -F'/' '{
        if (NF <= 2) print $0
        else printf "%s/%s\n", $(NF-1), $NF
    }'
}

extract_usage_from_transcript() {
  ### counts user messages in transcript file
  ### args: ${1} transcript file path
  ### returns: message count via stdout, or exits with error if file unreadable

    transcript="${1}"

    { [ -f "${transcript}" ] && [ -r "${transcript}" ]; } || return 1

    # count user messages, skip empty lines and tool results
    grep -v -e '^[[:space:]]*$' -e '"toolUseResult"' "${transcript}" | grep -c '"type":"user"'
}

get_usage_count() {
  ### gets validated user message count from transcript
  ### args: ${1} transcript file path
  ### exports: user_msg_count (defaults to 0 if invalid/missing)

    transcript_path="${1}"

    user_msg_count=0
    { [ -n "${transcript_path}" ]; } && {
        temp_count=$(extract_usage_from_transcript "${transcript_path}")
        { printf "%s" "${temp_count}" | grep -q '^[0-9]\+$'; } && {
            user_msg_count="${temp_count}"
        }
    }

    export user_msg_count
}


build_status_components() {
  ### assembles status line parts from parsed data
  ### exports: model_part, style_part, msg_part, version_part, cost_part, lines_add_part, lines_rm_part, has_lines

    model_part="🧠 ${model:-Claude}"

    style_part=""
    { [ "${style}" != "default" ] && [ -n "${style}" ]; } && {
        style_part=$(printf " [%s]" "${style}")
    }

    msg_part=""
    { [ "${user_msg_count}" -gt 0 ] 2>/dev/null; } && {
        msg_part=$(printf " 💬 %d" "${user_msg_count}")
    }

    version_part=""
    { [ -n "${version}" ]; } && {
        version_part=$(printf "[v%s] " "${version}")
    }

    cost_part=""
    { printf "%s" "${session_cost}" | grep -q '^[0-9]'; } && {
        cost_part=$(printf " 💰 $%.2f" "${session_cost}")
    }

    lines_add_part=""
    lines_rm_part=""
    has_lines="false"
    
    { [ "${lines_added}" -gt 0 ] 2>/dev/null; } && {
        lines_add_part="+${lines_added}"
        has_lines="true"
    }
    { [ "${lines_removed}" -gt 0 ] 2>/dev/null; } && {
        lines_rm_part="-${lines_removed}"
        has_lines="true"
    }

    export model_part style_part msg_part version_part cost_part lines_add_part lines_rm_part has_lines
}

output_status_line() {
  ### prints formatted status line with ansi colors
  ### args: $1 current working directory display path

    cwd="${1}"

    # ansi color codes
    dim="\033[2m"
    cyan="\033[36m"
    green="\033[32m"
    light_green="\033[92m"
    red="\033[31m"
    reset="\033[0m"

    # Build lines display format
    lines_display=""
    { [ "${has_lines}" = "true" ]; } && {
        if [ -n "${lines_add_part}" ] && [ -n "${lines_rm_part}" ]; then
            lines_display=$(printf " [%s%s%s/%s%s%s]" "${green}" "${lines_add_part}" "${reset}" "${red}" "${lines_rm_part}" "${reset}")
        elif [ -n "${lines_add_part}" ]; then
            lines_display=$(printf " [%s%s%s]" "${green}" "${lines_add_part}" "${reset}")
        elif [ -n "${lines_rm_part}" ]; then
            lines_display=$(printf " [%s%s%s]" "${red}" "${lines_rm_part}" "${reset}")
        fi
    }

    printf "${dim}${version_part}${model_part}${reset} @ ${cyan}📁 ${cwd}/${reset}${style_part}${msg_part}${lines_display}${light_green}${cost_part}${reset}\\n"
}

main() {
  ### orchestrates statusline generation using compose method pattern
  ### args: ${@} all command line arguments (passed to read_json_input)

    input=$(read_json_input "${@}")
    parse_json_fields "${input}"

    cwd=$(get_display_path "${full_cwd}")

    get_usage_count "${transcript_path}"

    build_status_components
    output_status_line "${cwd}"
}

main "${@}"
