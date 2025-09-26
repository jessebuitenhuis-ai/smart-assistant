from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from thread import Thread
from config import Config


class Agent:
    def __init__(self, user_name: str, thread_id: str, system_message: str, first_name: str, last_name: str):
        self.__llm = ChatOpenAI(model=Config.OPENAI_MODEL, temperature=Config.DEFAULT_TEMPERATURE)
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

