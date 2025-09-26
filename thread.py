from zep_cloud.client import AsyncZep
from zep_cloud import Message
from config import Config


class Thread:
    def __init__(self, thread_id: str, user_name: str, first_name: str, last_name: str):
        self.__zep = AsyncZep(api_key=Config.ZEP_API_KEY)
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
        thread = await self.__zep.thread.get(thread_id=self.__thread_id, lastn=Config.DEFAULT_HISTORY_LIMIT)
        history = [{"role": message.role, "content": message.content} for message in thread.messages]
        return history

    async def __ensure_thread(self):
        try:
            await self.__zep.thread.create(
                thread_id=self.__thread_id,
                user_id=self.__user_name
            )
        except Exception:
            pass

    async def __ensure_user(self):
        try:
            await self.__zep.user.add(
                user_id=self.__user_name,
                first_name=self.__first_name,
                last_name=self.__last_name
            )
        except Exception:
            pass