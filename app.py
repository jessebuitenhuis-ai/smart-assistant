import chainlit as cl
from agent import Agent
from config import Config
from typing import Dict, Optional

system_message = "You are a helpful AI assistant"

@cl.on_chat_start
async def start():
    thread_id = cl.user_session.get("id")
    agent = Agent(
        user_name=Config.USER_NAME,
        thread_id=thread_id,
        system_message=system_message,
        first_name=Config.FIRST_NAME,
        last_name=Config.LAST_NAME
    )
    await agent.init()
    cl.user_session.set("agent", agent)


@cl.on_message
async def main(message: cl.Message):
    agent: Agent = cl.user_session.get("agent")
    result = await agent.invoke(message.content)
    await cl.Message(content=result.content).send()

@cl.oauth_callback
def oauth_callback(
    provider_id: str,
    token: str,
    raw_user_data: Dict[str, str],
    default_user: cl.User,
) -> Optional[cl.User]:
    return default_user