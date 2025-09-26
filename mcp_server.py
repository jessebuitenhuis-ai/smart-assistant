from fastmcp import FastMCP
from knowledge_graph import KnowledgeGraph

server = FastMCP("smart-assistant")
graph = KnowledgeGraph()

@server.tool
async def search_facts(query: str, limit: int = 5) -> list[str]:
    """Search for facts in all conversations had with the user.
    
    Args:
        query (str): The search query.
        limit (int): The maximum number of results to return.
        
    Returns:
        list: A list of facts that match the query."""
    return await graph.search_facts(query, limit)

@server.tool
async def search_nodes(query: str, limit: int = 5) -> list[str]:
    """Search for nodes in all conversations had with the user.
    
    Args:
        query (str): The search query.
        limit (int): The maximum number of results to return.
        
    Returns:
        list: A list of nodes that match the query."""
    return await graph.search_nodes(query, limit)

if __name__ == "__main__":
    server.run(transport="sse", port=4567)