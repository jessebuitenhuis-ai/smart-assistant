import uuid
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import asyncio
from dotenv import load_dotenv
from zep_cloud.client import AsyncZep
from zep_cloud import Message
import os

load_dotenv()

class Thread:
    __zep = AsyncZep(api_key=os.environ.get("ZEP_API_KEY"))

    def __init__(self, thread_id: str, user_name: str, first_name: str, last_name: str):
        self.__thread_id = thread_id
        self.__user_name = user_name
        self.__first_name = first_name
        self.__last_name = last_name

    async def init(self):
        await self.__ensure_thread()
        await self.__ensure_user()

    async def get_user_context(self) -> str:
        return await self.__zep.thread.get_user_context(self.__thread_id)
    
    async def add_user_message(self, content: str):
        await self.add_message(
            content=content,
            role="user",
            user_name=self.__user_name
        )

    async def add_assistant_message(self, content: str):
        await self.add_message(
            content=content,
            role="assistant"
        )

    async def add_message(self, content: str, role: str, user_name: str | None = None):
        message = Message(
            content=content, 
            role=role, 
            name=user_name
        )
        await self.__zep.thread.add_messages(
            thread_id=self.__thread_id, 
            messages=[message]
        )

    async def get_history(self):
        thread = await self.__zep.thread.get(thread_id=self.__thread_id, lastn=6)
        history = [{ "role": message.role, "content": message.content } for message in thread.messages]
        return history

    async def __ensure_thread(self):
        try:
            await self.__zep.thread.create(
                thread_id=self.__thread_id, 
                user_id=self.__user_name
            )
        except Exception as e:
            pass

    async def __ensure_user(self):
        try:
            await self.__zep.user.add(
                user_id=self.__user_name,
                first_name=self.__first_name,
                last_name=self.__last_name
            )
        except Exception as e:
            pass


class Agent:
    __llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    def __init__(self, user_name: str, thread_id: str, system_message: str, first_name: str, last_name: str):
        self.__system_message = system_message
        self.__thread = Thread(thread_id, user_name, first_name, last_name)

    async def init(self):
        await self.__thread.init()

    async def invoke(self, user_input: str):
        await self.__thread.add_user_message(user_input)
        system_message = await self.__create_system_message()
        history = await self.__thread.get_history()
        response = await self.__llm.ainvoke([system_message] + history)
        await self.__thread.add_assistant_message(response.content)
        return response

    async def stream(self, user_input: str):
        await self.__thread.add_user_message(user_input)
        system_message = await self.__create_system_message()
        history = await self.__thread.get_history()

        full_content = ""
        async for chunk in self.__llm.astream([system_message] + history):
            if chunk.content:
                full_content += chunk.content
                yield chunk.content

        await self.__thread.add_assistant_message(full_content)

    async def __create_system_message(self):
        context = await self.__thread.get_user_context()

        return SystemMessage(content=f"""{self.__system_message}

        {context}
        """)

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
        print()  # For newline after streaming is done

if __name__ == "__main__":
    asyncio.run(main())
