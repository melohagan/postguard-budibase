<h1 align="center">postguard-budibase</h1>

<p align="center">
  <b>I was getting a null-pointer in postguard, so I've updated the codebase to return the parsed SQL queries, and I will validate this separately.</b>
</p>

```ts
const parsedQuery = result.query[0] //returning undefined, so I'm returining the query string instead.
```


MIT
