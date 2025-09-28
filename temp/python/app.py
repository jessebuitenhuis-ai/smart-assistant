import chainlit as cl
from agent import Agent
from config import Config
from typing import Dict, Optional
from chainlit import User

system_message = "You are a helpful AI assistant"

@cl.on_chat_start
async def start():
    thread_id = cl.user_session.get("id")
    user: User = cl.user_session.get("user")
    agent = Agent(
        user_name=user.identifier,
        thread_id=thread_id,
        system_message=system_message,
        first_name=user.metadata.get("first_name", ""),
        last_name=user.metadata.get("last_name", ""),
        email=user.metadata.get("email", "")
    )
    await agent.init()
    cl.user_session.set("agent", agent)


@cl.on_message
async def main(message: cl.Message):
    agent: Agent = cl.user_session.get("agent")
    stream = agent.stream(message.content)

    message = cl.Message(content="")
    async for chunk in stream:
        await message.stream_token(chunk)

    await message.update()

@cl.oauth_callback
def oauth_callback(
    provider_id: str,
    token: str,
    raw_user_data: Dict[str, str],
    default_user: cl.User,
) -> Optional[cl.User]:
    if (provider_id == "google"):
        return User(
            identifier=raw_user_data.get("id", ""),
            display_name=raw_user_data.get("name", ""),
            metadata={
                "image": raw_user_data.get("picture", ""),
                "email": raw_user_data.get("email", ""),
                "first_name": raw_user_data.get("given_name", ""),
                "last_name": raw_user_data.get("family_name", ""),
            }
        )

    return None
