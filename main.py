from dotenv import load_dotenv
from zep_cloud import AsyncZep, Message
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, add_messages, START, END
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage, trim_messages
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
import os
import asyncio
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)
zep = AsyncZep(api_key=os.environ.get("ZEP_API_KEY"))

first_name = "Jesse"
last_name = "Buitenhuis"
user_name = "jesse_buitenhuis"
thread_id = "thread_id_test_34543lkj"

async def create_user_and_thread():
    try:
        await zep.user.get(user_id=user_name)
        logger.info(f"User {user_name} already exists, skipping creation")
    except Exception:
        logger.info(f"Creating new user {user_name}")
        await zep.user.add(
            user_id=user_name,
            first_name=first_name,
            last_name=last_name
        )

    try:
        await zep.thread.get(thread_id=thread_id)
        logger.info(f"Thread {thread_id} already exists, skipping creation")
    except Exception:
        logger.info(f"Creating new thread {thread_id}")
        await zep.thread.create(
            thread_id=thread_id,
            user_id=user_name
        )
class State(TypedDict):
    messages: Annotated[list, add_messages]
    first_name: str
    last_name: str
    thread_id: str
    user_name: str

def create_zep_tools(user_name: str):
    """Create Zep tools configured for a specific user."""

    @tool
    async def search_facts(query: str, limit: int = 5) -> list[str]:
        """Search for facts in all conversations had with a user.
        
        Args:
            query (str): The search query.
            limit (int, optional): The maximum number of results to return. Defaults to 5.
            
        Returns:
            list[str]: A list of facts matching the query.
        """

        results = await zep.graph.search(
            user_id=user_name,
            query=query,
            limit=limit,
            scope="edges"
        )

        facts = [edge.fact for edge in results.edges or []]
        if not facts:
            return ["No facts found."]
        return facts
    
    @tool
    async def search_nodes(query: str, limit: int = 5) -> list[str]:
        """Search for nodes in all conversations had with a user.
        
        Args:
            query (str): The search query.
            limit (int, optional): The maximum number of results to return. Defaults to 5.
            
        Returns:
            list[str]: A list of node texts matching the query.
        """

        result = await zep.graph.search(
            user_id=user_name,
            query=query,
            limit=limit,
            scope="nodes"
        )
        
        summaries = [node.summary for node in result.nodes or []]
        if not summaries:
            return ["No nodes found."]
        return summaries
    
    return [search_facts, search_nodes]

def create_agent(user_name: str):
    """Create a langgraph agent configured for a specific user."""
    tools = create_zep_tools(user_name)
    tool_node = ToolNode(tools=tools)
    llm_with_tools = ChatOpenAI(model="gpt-4o-mini", temperature=0).bind_tools(tools)

    async def chatbot_with_tools(state: State):
        memory = await zep.thread.get_user_context(state["thread_id"])
        logger.info(f"Memory context: {memory.context}")

        system_message = SystemMessage(
            content=f"""You are a helpful assistant.
            
            {memory.context}"""
        )

        messages = [system_message] + state["messages"]
        response = await llm_with_tools.ainvoke(messages)

        human_message_content = state["messages"][-1].content
        human_full_name = state["first_name"] + " " + state["last_name"] 

        messages_to_save = [
            Message(
                role="user",
                name=human_full_name,
                content=human_message_content
            ),
            Message(
                role="assistant",
                content=response.content
            )
        ]

        await zep.thread.add_messages(
            thread_id=state["thread_id"],
            messages=messages_to_save
        )

        state["messages"] = trim_messages(
            state["messages"],
            strategy="last",
            token_counter=len,
            max_tokens=5,
            start_on="human",
            end_on=("human", "tool"),
            include_system=True
        )

        logger.info(f"Messages in state: {state['messages']}")

        return { "messages": [response] }

    async def should_continue(state: State, config):
        messages = state["messages"]
        last_message = messages[-1]

        if not last_message.tool_calls:
            return "end"
        else:
            return "continue"
        
    graph_builder = StateGraph(State)
    memory = MemorySaver()

    graph_builder.add_node("agent", chatbot_with_tools)
    graph_builder.add_node("tools", tool_node)

    graph_builder.add_edge(START, "agent")
    graph_builder.add_conditional_edges("agent", should_continue, {"continue": "tools", "end": END})
    graph_builder.add_edge("tools", "agent")

    return graph_builder.compile(checkpointer=memory)

async def main():
    await create_user_and_thread()
    graph = create_agent(user_name)

    def extract_messages(result, user_name):
        output = ""
        for message in result["messages"]:
            if isinstance(message, AIMessage):
                name = "assistant"
            else:
                name = user_name
            output += f"{name}: {message.content}\n"
        return output

    async def graph_invoke(
        message: str,
        first_name: str,
        last_name: str,
        user_name: str,
        thread_id: str,
        ai_response_only: bool = True
    ):
        r = await graph.ainvoke(
            {
                "messages": [HumanMessage(content=message)],
                "first_name": first_name,
                "last_name": last_name,
                "user_name": user_name,
                "thread_id": thread_id
            },
            config={"configurable": {"thread_id": thread_id}}
        )
        
        if ai_response_only:
            return r["messages"][-1].content
        else:
            return extract_messages(r, user_name)

    output = await graph_invoke(
        "Hi there",
        first_name,
        last_name,
        user_name,
        thread_id
    )

    print(output)

if __name__ == "__main__":
    asyncio.run(main())
