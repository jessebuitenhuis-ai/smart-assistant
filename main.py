import uuid
import asyncio
from agent import Agent


async def main():
    first_name = "Jesse"
    last_name = "Buitenhuis"
    user_name = "jesse_buitenhuis"
    thread_id = f"{user_name}_{uuid.uuid4().hex}"
    system_message = "You are a helpful AI assistant"

    agent = Agent(
        user_name=user_name,
        thread_id=thread_id,
        system_message=system_message,
        first_name=first_name,
        last_name=last_name
    )
    await agent.init()

    while True:
        user_input = input("> ")
        if user_input.lower() == "exit":
            break

        stream = agent.stream(user_input)

        print("Assistant: ", end="", flush=True)
        async for chunk in stream:
            print(chunk, end="", flush=True)
        print()


if __name__ == "__main__":
    asyncio.run(main())