#!/bin/sh

# Status line for Claude Code

# read & parse input
input=$(cat)

# Save JSON input to file with comments for removal - REMOVE_START
echo "# JSON input saved on $(date)" > ~/.claude/statusline-input.json  # REMOVE_LINE
echo "# You can remove lines marked with REMOVE_LINE or between REMOVE_START/REMOVE_END" >> ~/.claude/statusline-input.json  # REMOVE_LINE
echo "$input" >> ~/.claude/statusline-input.json  # REMOVE_LINE
# REMOVE_END

# Parse JSON fields using shell parameter expansion
model=${input#*'"display_name":"'} && model=${model%%'"'*}
cwd=${input#*'"current_dir":"'} && cwd=${cwd%%'"'*}
style=${input#*'"name":"'} && style=${style%%'"'*}
transcript_path=${input#*'"transcript_path":"'} && transcript_path=${transcript_path%%'"'*}

# Extract token usage and user message count from transcript JSONL file
extract_usage_from_transcript() {
    local transcript="$1"
    
    # Check if transcript file exists and is readable
    if [ ! -f "$transcript" ] || [ ! -r "$transcript" ]; then
        return 1
    fi
    
    # Initialize counters
    local total_input=0
    local total_output=0
    local total_cache_creation=0
    local total_cache_read=0
    local user_msg_count=0
    
    # Read JSONL file line by line and extract usage data
    while IFS= read -r line; do
        # Skip empty lines
        [ -z "$line" ] && continue
        
        # Count user messages (exclude tool results)
        if echo "$line" | grep -q '"type":"user"' && ! echo "$line" | grep -q '"toolUseResult"'; then
            user_msg_count=$((user_msg_count + 1))
        fi
        
        # Check if line contains usage data
        if echo "$line" | grep -q '"usage"'; then
            # Extract token values using basic string manipulation
            input=$(echo "$line" | sed -n 's/.*"input_tokens":\([0-9]*\).*/\1/p')
            output=$(echo "$line" | sed -n 's/.*"output_tokens":\([0-9]*\).*/\1/p')
            cache_creation=$(echo "$line" | sed -n 's/.*"cache_creation_input_tokens":\([0-9]*\).*/\1/p')
            cache_read=$(echo "$line" | sed -n 's/.*"cache_read_input_tokens":\([0-9]*\).*/\1/p')
            
            # Add to totals (default to 0 if not found)
            total_input=$((total_input + ${input:-0}))
            total_output=$((total_output + ${output:-0}))
            total_cache_creation=$((total_cache_creation + ${cache_creation:-0}))
            total_cache_read=$((total_cache_read + ${cache_read:-0}))
        fi
    done < "$transcript"
    
    # Output the totals including user message count
    echo "$total_input $total_output $total_cache_creation $total_cache_read $user_msg_count"
}

# Get usage data from transcript
if [ -n "$transcript_path" ]; then
    usage_data=$(extract_usage_from_transcript "$transcript_path")
    if [ $? -eq 0 ] && [ -n "$usage_data" ]; then
        input_tokens=$(echo "$usage_data" | cut -d' ' -f1)
        output_tokens=$(echo "$usage_data" | cut -d' ' -f2)
        cache_creation_tokens=$(echo "$usage_data" | cut -d' ' -f3)
        cache_read_tokens=$(echo "$usage_data" | cut -d' ' -f4)
        user_msg_count=$(echo "$usage_data" | cut -d' ' -f5)
    else
        # No transcript data available
        input_tokens=0
        output_tokens=0
        cache_creation_tokens=0
        cache_read_tokens=0
        user_msg_count=0
    fi
else
    # No transcript path provided
    input_tokens=0
    output_tokens=0
    cache_creation_tokens=0
    cache_read_tokens=0
    user_msg_count=0
fi

# Calculate session cost estimation
calculate_cost() {
    local input_t="$1"
    local output_t="$2" 
    local cache_creation_t="$3"
    local cache_read_t="$4"
    
    # Handle empty/missing values
    input_t=${input_t:-0}
    output_t=${output_t:-0}
    cache_creation_t=${cache_creation_t:-0}
    cache_read_t=${cache_read_t:-0}
    
    # Pricing per token (approximations)
    # Input: $0.000015, Output: $0.000075, Cache read: $0.000001
    # Using integer arithmetic (multiply by 1000000 to avoid floating point)
    
    # Calculate costs in micro-dollars (multiply by 1,000,000)
    input_cost=$((input_t * 15))           # 0.000015 * 1,000,000 = 15
    output_cost=$((output_t * 75))         # 0.000075 * 1,000,000 = 75  
    cache_creation_cost=$((cache_creation_t * 15))  # Same as input
    cache_read_cost=$((cache_read_t * 1))  # 0.000001 * 1,000,000 = 1
    
    # Total in micro-dollars
    total_micro=$((input_cost + output_cost + cache_creation_cost + cache_read_cost))
    
    # Convert to dollars and cents
    if [ $total_micro -lt 1000 ]; then
        # Less than $0.001, show in sub-cents
        printf "¢0.%d" $((total_micro / 10))
    elif [ $total_micro -lt 10000 ]; then
        # Less than $0.01, show in tenth-cents  
        cents=$((total_micro / 10))
        printf "¢%d.%d" $((cents / 100)) $((cents % 100))
    elif [ $total_micro -lt 100000 ]; then
        # Less than $0.10, show in cents
        printf "¢%d" $((total_micro / 10000))
    else
        # $0.10 or more, show in dollars
        dollars=$((total_micro / 1000000))
        cents=$(((total_micro % 1000000) / 10000))
        if [ $cents -eq 0 ]; then
            printf "$%d" $dollars
        else
            printf "$%d.%02d" $dollars $cents
        fi
    fi
}


# Only calculate cost if we have actual token data
if [ "$input_tokens" -gt 0 ] || [ "$output_tokens" -gt 0 ] || [ "$cache_creation_tokens" -gt 0 ] || [ "$cache_read_tokens" -gt 0 ]; then
    cost_display=$(calculate_cost "$input_tokens" "$output_tokens" "$cache_creation_tokens" "$cache_read_tokens")
else
    cost_display=""
fi

# git
branch=$(git branch --show-current 2>/dev/null)
dirty=$([ -n "$(git status --porcelain 2>/dev/null)" ] && printf "*")

# builder
model_part="${model:-Claude}"
git_part=$([ -n "${branch}" ] && printf " %s%s" "${branch}" "${dirty}")
style_part=$([ "${style}" != "default" ] && [ -n "${style}" ] && printf " [%s]" "${style}")
cost_part=$([ -n "${cost_display}" ] && printf " %s" "${cost_display}")
msg_part=$([ "${user_msg_count:-0}" -gt 0 ] && printf " %dm" "${user_msg_count}")

# output
printf "\033[2m%s\033[0m \033[36m%s\033[0m\033[2m%s%s%s\033[0m\033[32m%s\033[0m\n" \
    "${model_part}" "${cwd}" "${git_part}" "${style_part}" "${msg_part}" "${cost_part}"
