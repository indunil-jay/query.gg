# UseQuery() Hook

the primary way you'll be interacting with the cache is via the `useQuery hook`.Under the hood, `useQuery` will `subscribe` to the `QueryCache` and re-render whenever the `data it cares about in the cache changes`.

Naturally, this brings up a couple questions.

1. How does it know which data it cares about? (key)
2. How does it know where to get that data from? (fn that resolve to be a promise)

The answer to both of these lies in the object that useQuery receives.
When you invoke useQuery, you'll almost always give it two things: a `queryKey` and a `queryFn`.

```JS

const { data } = useQuery({
  queryKey: ['todo'],
  queryFn: () => Promise.resolve({todoId:1,title:"Hello World"}),
})
```

By default, if there's already data located in the cache at the `queryKey`, `useQuery` will return that data immediately.

Otherwise, it will invoke the `queryFn`, take whatever data that the `promise` returned from the `queryFn` resolves with, put it in the cache at the `queryKey`, and then return it. There are a few things to keep in mind.

First, because the `queryKey` will be used as the `key` of the `Map in the cache`, it must be `globally unique`.

Second, `queryFn` must return a `promis`e that resolves with the data you want to cache. This isn't terribly hard to remember since most of the time the queryFn will be an async request (usually using fetch) that returns a promise by default.

## Deduplication

Deduplication in React Query is a powerful feature that `prevents duplicate requests for the same data`. When multiple components or parts of an application invoke useQuery with the same queryKey, React Query ensures that the request is made only once. The result is then shared among all instances using that queryKey.
Here’s how it works:
When useQuery is called, React Query f`irst checks the cach`e for a value associated with the provided `queryKey`.

-   If the value exists, it is returned immediately without re-fetching the data.
-   If the value does not exist, React Query runs the queryFn, stores the resolved value in the cache, and then returns it.

Even when useQuery invocations occur in different components, the same logic applies. React Query’s global cache ensures that data is consistently shared across components, reducing redundant fetches and optimizing application performance.

By abstracting away cache management, React Query simplifies data fetching, promotes reusability, and ensures efficiency in handling queries.

## Leveraging the Observer Pattern in React Query

React Query’s ability to simplify complex asynchronous logic into reusable, synchronous-like hooks is powered by its use of `Query Observers` and the `Observer Pattern`. This design pattern is `key` to how React Query keeps your UI synchronized with its global cache.

### How It Works

The cache in React Query exists outside of React, so a mechanism is needed to keep the data in the cache aligned with React components. Observers serve as the link between your components and the queries stored in the cache.

Here’s the process:

-   **Creating Observers:** Each time a component mounts and calls useQuery, it creates an observer tied to a specific queryKey.
-   **Watching the Cache:** The observer monitors the cache for changes related to its assigned queryKey.
-   **Re-rendering Components:** When the cache updates, the observer is notified, triggering a re-render of the component. This ensures the UI always reflects the most recent data.

### Maximum Predictability and Performance

This approach guarantees maximum predictability. Every component will `consistently` display the exact value stored in the cache. It also optimizes performance by calling the queryFn only when necessary, avoiding redundant fetches.

What’s more, the global nature of the cache means that it doesn’t matter where components are in the component tree. As long as they are under the same `QueryClientProvider`, they will read from the same cache, ensuring a shared and consistent state across the application.

By abstracting query logic into reusable hooks and leveraging the Observer Pattern, React Query delivers a seamless and highly performant data-fetching experience.

### Understanding the Query Lifecycle in React Query

One of React Query's standout features is making asynchronous logic feel synchronous. However, it’s essential to understand that asynchronous operations still have an underlying lifecycle that needs careful handling to avoid common pitfalls.

The Problem

Imagine you want to display a list of to-dos from the DummyJSON API. Using useQuery, your implementation might look like this:

```JS
import React from 'react';
import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('https://dummyjson.com/todos').then(res => res.json()),
  });

  return (
    <ul>
      {data.todos.map((todo) => (
        <li key={todo.id}>{todo.todo}</li>
      ))}
    </ul>
  );
}


```

At first glance, this code appears correct. However, there's a significant issue: data will be undefined while the query is pending, leading to an error when map is called on it
`TypeError: Cannot read properties of undefined (reading 'map')`

### React Query's Query Lifecycle

React Query manages the lifecycle of asynchronous queries through internal states, ensuring your UI remains in sync with your data fetching logic. These states correspond to the stages of a JavaScript Promise:

-   loading: The query is in progress, and data is not yet available.
-   success: The query has completed successfully, and data is available.
-   error: The query has failed, and error information is accessible.

Understanding these states is crucial for handling asynchronous data correctly in your components.
Solutions: Handling Query States

React Query provides two primary ways to handle these states and ensure the UI reflects the query’s lifecycle seamlessly:

-   Using the status Property
-   Using Derived Boolean Flags

Let's explore both approaches using our To-Do List example.

#### 1. Using the status Property

The status property explicitly describes the query's current state. You can use it to conditionally render different UI elements based on whether the data is loading, has loaded successfully, or encountered an error.

```JS
import React from 'react';
import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data, status } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('https://dummyjson.com/todos').then(res => res.json()),
  });

  if (status === 'pending') {
    return <div>Loading to-dos...</div>;
  }

  if (status === 'error') {
    return <div>Failed to load to-dos. Please try again later.</div>;
  }

  return (
    <ul>
      {data.todos.map((todo) => (
        <li key={todo.id}>{todo.todo}</li>
      ))}
    </ul>
  );
}

```

Explanation:

-   status === 'pending': While the data is being fetched, display a loading indicator.
-   status === 'error': If the fetch fails, show an error message.
-   Default ('success'): Once data is successfully fetched, render the list of to-dos.

#### 2. Using Derived Boolean Flags

React Query also offers boolean flags such as isLoading, isSuccess, and isError, which provide a more expressive and readable way to handle query states.

```JS
import React from 'react';
import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('https://dummyjson.com/todos').then(res => res.json()),
  });

  if (isLoading) {
    return <div>Loading to-dos...</div>;
  }

  if (isError) {
    return <div>Failed to load to-dos. Please try again later.</div>;
  }

  return (
    <ul>
      {data.todos.map((todo) => (
        <li key={todo.id}>{todo.todo}</li>
      ))}
    </ul>
  );
}

export default TodoList;


```

Explanation:

-   isLoading: Indicates that the query is currently loading.
-   isError: Indicates that the query encountered an error.
-   Default (isSuccess): When neither isLoading nor isError is true, the data has been successfully fetched.

##### Which Approach to Choose?

Both methods are equally valid and effective. The choice between using status or the boolean flags (isLoading, isSuccess, isError) depends on your coding style and team preferences. Here are some considerations:

-   Readability: Boolean flags can make conditional checks more readable and intuitive.
-   Flexibility: Using status can be beneficial if you need to handle additional states or have more complex logic based on the query's status.

Recommendation: Whichever approach you choose, consistently handle query states across your components to ensure a robust and error-free application.

By leveraging React Query's query lifecycle management, you can handle asynchronous data fetching gracefully and efficiently. Whether you choose to use the status property or the boolean flags, React Query provides the tools necessary to ensure your UI remains in sync with your data.

This approach not only enhances the predictability of your application by ensuring that every component reflects the exact state of the data in the cache but also optimizes performance by minimizing unnecessary network requests. Additionally, because the cache is global, any component within the QueryClientProvider can access and share the same cached data, promoting consistency and reusability across your application.

Embracing React Query's lifecycle management allows you to build robust, responsive, and maintainable applications with ease

### Fetch Data

So with that said, up until now, why have we focused so much on examples that have nothing to do with fetching data?

Because React Query doesn't care about where the Promise comes from and by getting into the mindset that React Query is an async, promise-based state manager, you can eliminate an entire subset of questions upfront:

    - How can I read response headers with React Query?
    - How can I use GraphQL with React Query?
    - How can I add an auth token to my requests with React Query?

fetch takes in a url of the resource you wish to fetch and an optional options object to configure the request.

Once invoked, the browser will start the request immediately and return you a Promise. From there, getting a response is usually a two-step process.

First, the promise returned from fetch will resolve with a Response object as soon as the server responds with headers. This object contains information about the response (like those headers, the HTTP status code, etc.), but does not contain the actual data.

If you're unfamiliar with it, the most surprising thing about fetch will be that it doesn't reject the Promise if the request fails. Meaning, if the status code of the response is in the 4xx or 5xx range, the Promise will still resolve as normal.

This can be a bit unintuitive if you're trying to catch errors like you would with other Promise-based APIs.

To get around this, you'll usually follow a pattern where you check if response.ok is true (which it will be if the response's status is in the 2xx range), and throw an error if it isn't.

```ts
const fetchRepos = async () => {
    try {
        const response = await fetch(
            "https://api.github.com/orgs/TanStack/repos"
        );

        if (response.ok) {
        } else {
            throw new Error(`Request failed with status: ${response.status}`);
        }
    } catch (error) {
        // handle network errors
    }
};
```

Assuming you're fetching JSON, you can call .json on the Response object which will return another Promise that resolves with the parsed JSON data.

```ts
const fetchRepos = async () => {
    try {
        const response = await fetch(
            "https://api.github.com/orgs/TanStack/repos"
        );

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Request failed with status: ${response.status}`);
        }
    } catch (error) {
        // handle network errors
    }
};
```

Now, if we combine this with our knowledge of useQuery (and specifically the queryFn), we get something like this.

```TS
function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: async () => {
      const response = await fetch('https://api.github.com/orgs/TanStack/repos')

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`)
      }

      return response.json()
    },
  })
}
```

There are a couple things to notice here.

First, we were able to get rid of our try/catch code. In order to tell React Query that an error occurred, and therefore, to set the status of the query to error, all you have to do is throw an error in your queryFn.

Second, we were able to return response.json() directly. As you know, your query function should return a promise that eventually resolves with the data you want to cache. That's exactly what we're doing here, since response.json() returns a promise that resolves with the parsed JSON data.

### Managing Query Dependencies

Real world enpoint are not so static, they are dynamic so we have some keys or dependencies to
handle along with the enpoint url, quetions are that how we manage with react query and how react query response to that,

let take this example.

```TS
fetch('https://api.github.com/orgs/TanStack/repos?sort=created')



function useRepos(sort) {
  return useQuery({
    queryKey: ['repos'],
    queryFn: async () => {
      const response = await fetch(
        `https://api.github.com/orgs/TanStack/repos?sort=${sort}`
      )

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`)
      }

      return response.json()
    },
  })
}

```

Unfortunately, this won't work. this work as same as before it does not response any dynamic changes becuase of cache.
Odds are, whether you realize it or not, you're assuming that React Query will re-run the queryFn whenever the component re-renders. That's not how it works.

In hindsight, this should be quite obvious. A component can re-render for a variety of reasons, and we don't want to refetch whenever that happens.

Solution is that, Whenever a value in the queryKey array changes, React Query will re-run the queryFn. What that means is that anything you use inside of the queryFn should also be included in the queryKey array.

`` Wait a minute
Now I know what you're thinking – that sounds awfully similar to useEffect's dependency array, and you already convinced me previously that useEffect's dependency array is bad.

Fair, but the queryKey doesn't have many of the drawbacks that useEffect has.

In particular, you don't have to worry about things in the queryKey being "referentially stable". You can put Arrays and Objects in there, and React Query will
hash them
deterministically.
``

```TS
import { useQuery } from '@tanstack/react-query'

export default function useRepos(sort) {
  return useQuery({
    queryKey: ['repos', { sort }],
    queryFn: async () => {
      const response = await fetch(
        `https://api.github.com/orgs/TanStack/repos?sort=${sort}`
      )

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`)
      }

      return response.json()
    },
  })
}
```

But perhaps the more interesting question here is how does this work under the hood?

As you know, queryKeys directly correspond to entries in the cache. After all, they are the key of our cache's Map.

When a value in the queryKey array changes, something interesting happens – our observer changes what it's observing.

It goes from being subscribed to one key to another:

```TS
- ['repos', { sort: 'created' }]
+ ['repos', { sort: 'updated' }]
```

if we're switching to it for the first time, there probably isn't any data available for that cache entry, so a new one is created for us.

The new entry starts out in a pending state, and the queryFn is called to fetch the data.

As it relates to our example, that's also why we see the ... whenever a new sort is selected for the first time, just like we did when the component was first mounted.

Now, what do you think happens if we switch back to a queryKey that is already in the cache? In our example, created.

The observer changes back again, but this time, our cache for this key is already filled, so useQuery is able to instantly give us that data and the state of the query goes directly to success

By storing data by its dependencies, React Query makes sure that fetches with different parameters will never overwrite each other. Instead, they are cached independently alongside each other under different keys, so that you get constant time lookups when switching between them.

After all, that is mostly what caching is about: being able to deliver data that we have previously fetched as quickly as possible. And conveniently, this is also what allows us to trigger automatic fetches if a value in the queryKey changes.

It's also the reason why React Query doesn't suffer from race conditions - it's all handled for you.

The only thing you need to make sure of, is to include every value that you use inside the queryFn, in the queryKey array.

### **Data Synchronization**

When handling requests through a browser, caching headers are added automatically to manage repeated requests from the same IP. This mechanism stores response data in the cache for a short period, allowing subsequent requests to retrieve data directly from the cache instead of making new network calls.

In contrast, **React Query** does not rely on HTTP caching headers. Instead, it manages caching internally using a concept called **"stale time."** This determines how long the fetched data remains fresh within the query cache.

-   By default, the **stale time** is set to `0`. This means that as soon as the data is received and stored in the cache, it becomes stale immediately.
-   Any subsequent requests will trigger a new fetch since no fresh data is cached for future use.
-   You can adjust the stale time based on your specific scenario to minimize unnecessary network requests and optimize performance.

---

#### **How Does React Query Know When to Refetch Data?**

React Query triggers a refetch in the following situations:

1. **The query key changes** – This typically happens when query parameters change.
2. **A new observer mounts** – When a new component subscribes to the query.
3. **The window receives a focus event** – Refetches automatically when the window regains focus (useful for ensuring up-to-date data).
4. **The device goes online** – Automatically refetches data when the device reconnects to the internet after going offline.

```TS

//  default
useQuery({
  queryKey: ['repos', { sort }],
  queryFn: () => fetchRepos(sort),
  staleTime: 0
})

//customize live time
useQuery({
  queryKey: ['repos', { sort }],
  queryFn: () => fetchRepos(sort),
  staleTime: 5 * 1000 // 5,000 ms or 5 seconds
})

```

Customizing Triggers
Of course, if you think you're smarter than the defaults, you're more than welcome to turn them off when you create your query.

```TS
useQuery({
  queryKey: ['repos', { sort }],
  queryFn: () => fetchRepos(sort),
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
})
```

However, if you're just wanting to be more conservative with your refetches, the better option is to just increase your staleTime.

And if you're really worried (and confident the data will never change), you can even make cached data fresh forever by setting staleTime to Infinity:

```TS
useQuery({
  queryKey: ['repos', { sort }],
  queryFn: () => fetchRepos(sort),
  staleTime: Infinity
}

```

# Fetching on demand

what if we needed to get some input from the user first in order to make the request? What exactly would that look like using useQuery?

```TS
const [search, setSearch] = React.useState('')

if (search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: () => fetchIssues(search),
  })
}
```

This code seems perfectly reasonable. Unfortunately, React won't even let you do this because it violates the rules of hooks. Specifically, you can't call hooks conditionally as we're doing in our if statement.

Instead, React Query offers another configuration option via its enabled property.

enabled allows you to pass a boolean value to useQuery that determines whether or not the query function should run.

In our case, enabled allows us to tell React Query that we only want to run the queryFn when we have a search term.

```TS
function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: () =>  fetchIssues(search),
    enabled: search !== ''
  })
}

```

```TS
import * as React from "react"
import { useQuery } from '@tanstack/react-query'
import Search from "./Search"
import { fetchIssues } from "./api"

function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: () =>  fetchIssues(search),
    enabled: search !== ''
  })
}

function IssueList ({ search }) {
  const { data, status } = useIssues(search)

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>There was an error fetching the issues</div>
  }

  return (
    <p>
      <ul>
        {data.items.map((issue) =>
          <li key={issue.id}>{issue.title}</li>
        )}
      </ul>
    </p>
  )
}

export default function App() {
  const [search, setSearch] = React.useState('')

  return (
    <div>
      <Search onSubmit={(s) => setSearch(s)} />
      <IssueList search={search} />
    </div>
  )
}

```

Well that's not ideal.

Notice that before a user ever types into the input field, they're already seeing the ... loading indicator. Why is that?

Remember, a query can only ever be in one of three states - pending, success or error.

success means there is data available in the cache, error means there was an error in trying to get the data to put in the cache, and pending means literally anything else.

Right now, in order to show our loading indicator, we're checking if the query is in a pending state.

But again, pending only tells us that there isn't data available in the cache and there wasn't an error in fetching that data. It doesn't tell us if the query is currently fetching or not – as we're assuming it does by treating it as the conditional for our loading indicator.

What we really need is a way to know if the queryFn is currently being executed. If it is, that will help us in determining if we should show the loading indicator or not.

Thankfully, React Query exposes this via a fetchStatus property on the query object.

```TS
const { data, status, fetchStatus } = useIssues(search)
```

When fetchStatus is fetching, the queryFn is being executed.

We can use this, along with the status of the query, to more accurately derive when we should show the loading indicator.

```TS
const { data, status, fetchStatus } = useIssues(search)

if (status === 'pending') {
  if (fetchStatus === 'fetching') {
    return <div>...</div>
  }
}
```

This makes sense. If the status is pending, that means there isn't data available in the cache. If the fetchStatus is fetching, that means the queryFn is currently being executed. If there's no data in the cache and the queryFn is currently being executed, we should show the loading indicator.

In fact, this pattern is so common that React Query provides a derived value, appropriately named isLoading, that is shorthand for the code above.

```TS
const { data, status, isLoading } = useIssues(search)

if (isLoading) {
  return <div>...</div>
}
```

```TS
function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: () =>  fetchIssues(search),
    enabled: search !== ''
  })
}

function IssueList ({ search }) {
  const { data, status, isLoading } = useIssues(search)

  if (isLoading) {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>There was an error fetching the issues</div>
  }

  return (
    <p>
      <ul>
        {data.items.map((issue) =>
          <li key={issue.id}>{issue.title}</li>
        )}
      </ul>
    </p>
  )
}

export default function App() {
  const [search, setSearch] = React.useState('')

  return (
    <div>
      <Search onSubmit={(s) => setSearch(s)} />
      <IssueList search={search} />
    </div>
  )
}
```

Sadly, not quite. As is, we get this error.

Cannot read properties of undefined (reading 'items')
This is another really good moment to pause and try to figure out why this is happening for yourself. There's another Aha! moment waiting for you at the end of your journey.

The reason this is happening is because we're assuming that if isLoading is false, and the status isn't error, then we have data. Unfortunately, that's the wrong assumption.

Remember, isLoading is only telling us if the status is pending and the fetchStatus is fetching. If we break that down even further, a pending status means there's no data in the cache, and a fetching fetchStatus means the queryFn is currently being executed.

So what happens in the scenario where the status is pending because there's no data in the cache, and the fetchStatus isn't fetching because the queryFn isn't currently being executed? In this scenario, isLoading will be false.

In fact, this is the exact scenario we find ourselves in.

Dealing with these sort of logical brain teasers is always a little tricky, so here's some code that represents exactly what is going on in our app to help.

```TS
const data = undefined // There's no data in the cache
const status = "pending" // There's no data in the cache
const fetchStatus = "idle" // The queryFn isn't currently being executed
const isLoading = status === "pending" && fetchStatus === "fetching" // false

if (isLoading) {
  return <div>...</div>
}

if (status === 'error') {
  return <div>There was an error fetching the issues</div>
}

return (
  <p>
    <ul>
      {data.items.map((issue) =>
        <li key={issue.id}>{issue.title}</li>
      )}
    </ul>
  </p>
)

```

Can you see the issue now?

There are two scenarios we're not accounting for, and they're both represented by the code above. First is the scenario where our queryFn is not enabled because we don't have a search term and second is the scenario where our API request returns no data.

The solution to both is to never assume we have data without explicitly checking if the status of the query is success. Again, a status of success means there is data in the cache.

```TS
function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: () =>  fetchIssues(search),
    enabled: search !== ''
  })
}

function IssueList ({ search }) {
  const { data, status, isLoading } = useIssues(search)

  if (isLoading) {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>There was an error fetching the issues</div>
  }

  if (status === "success") {
    return (
      <p>
        <ul>
          {data.items.map((issue) =>
            <li key={issue.id}>{issue.title}</li>
          )}
        </ul>
      </p>
    )
  }

  return <div>Please enter a search term</div>
}

export default function App() {
  const [search, setSearch] = React.useState('')

  return (
    <div>
      <Search onSubmit={(s) => setSearch(s)} />
      <IssueList search={search} />
    </div>
  )
}
```

By explicitly checking the status of the query for success, we can be confident that there is data in the cache that we can safely access.

And one last time for those of you who get a little twisted up with logical puzzles like this (myself included), here's our IssueList component with comments to help cement what exactly is going on.

```TS
function IssueList ({ search }) {
  const { data, status, isLoading } = useIssues(search)

  if (isLoading) {
    // there is no data in the cache
    // and the queryFn is currently being executed
    return <div>...</div>
  }

  if (status === 'error') {
    // there was an error fetching the data to put in the cache
    return <div>There was an error fetching the issues</div>
  }

  if (status === "success") {
    // there is data in the cache
    return (
      <p>
        <ul>
          {data.items.map((issue) =>
            <li key={issue.id}>{issue.title}</li>
          )}
        </ul>
      </p>
    )
  }

  // otherwise
  return <div>Please enter a search term</div>
}
```

Other pattern

```TS
function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: () =>  fetchIssues(search),
  })
}

function IssueList ({ search }) {
  const { data, status } = useIssues(search)

  if (status === "pending") {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>There was an error fetching the issues</div>
  }

  return (
    <p>
      <ul>
        {data.items.map((issue) =>
          <li key={issue.id}>{issue.title}</li>
        )}
      </ul>
    </p>
  )
}

export default function App() {
  const [search, setSearch] = React.useState('')

  return (
    <div>
      <Search onSubmit={(s) => setSearch(s)} />
      {search
        ? <IssueList search={search} />
        : <div>Please enter a search term</div>}
    </div>
  )
}
```

### Garbage Collection

React Query's special sauce is its cache, and like any sauce, you can't trust it unless it has an expiration date.

The reason, in React Query's case, is because its cache is kept in memory which is finite. Without purging the cache on occasion, it would grow indefinitely, causing memory issues on low-end devices.
Not only that, but there will always come a moment in a cache's life where it's deemed "too old" to be shown, even as stale data, to the user.

Of course, this is always a balancing act. Data in the cache means a more responsive app, but old, irrelevant data does more harm than good.

That's why React Query comes with automatic garbage collection built in.
If you're not familiar, Garbage Collection (GC) is a form of memory management where memory that has been allocated by a program will be automatically released after it is no longer in use. Most high level programming languages we use today, including JavaScript, utilize garbage collection in some capacity.

React Query does as well, but it does so with a time-based collector called gcTime. This setting determines when a query's data should be removed from the cache – and it defaults to 5 minutes.

Now you might be thinking, "so does this mean that React Query will remove data 5 minutes after it's been added to the cache?" No.

As long as the data is being actively used, it's not eligible for garbage collection. Of course, this brings up another obvious question, what exactly does "actively used" mean?

Remember how every time a component mounts, it creates an Observer for each call to useQuery? That is what makes a query active. And by the same definition, a query that has no Observers is considered inactive.

Conveniently, Observers get destroyed when a component unmounts and is removed from the DOM. If there are none left, React Query can be confident that it should start the garbage collection timer for that entry in the cache.

A practical example would be our search functionality that we saw when we talked about fetching on demand.

Every search produces a new cache entry, and as soon as we search for something new, the previous entry becomes inactive (because the Observer will switch to observing the new queryKey).

If we search for the same term within the next 5 minutes, we'll get data served from the cache (and we might also get a background refetch if that data is stale).

But if we search for it again at some point in the future more than 5 minutes after the initial Observer had been removed, the cache entry will have already been removed, and the user will see a loading indicator.

Of course, gcTime is customizable and can be set to any value you see fit when you invoke useQuery.

```TS
function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: () =>  fetchIssues(search),
    enabled: search !== '',
    staleTime: 5000, // 5 seconds
    gcTime: 3000, // 3 seconds
  })
}
```

### Polling Data

Take this scenario, say you were building an analytics dashboard for your company. More than likely, you'd want to make sure that the data is always up to date after a certain amount of time – regardless of if a "trigger" occurs.

To achieve this, you need a way to tell React Query that it should invoke the queryFn periodically at a specific interval, no matter what.

This concept is called polling, and you can achieve it by passing a refetchInterval property to useQuery when you invoke it.

```TS
useQuery({
  queryKey: ['repos', { sort }],
  queryFn: () => fetchRepos(sort),
  refetchInterval: 5000 // 5 seconds
})
```

Now with a refetchInterval of 5000, the queryFn will get invoked every 5 seconds, regardless of if there's a trigger or if the query still has fresh data.

Because of this, refetchInterval is best suited for scenarios where you have data that changes often and you always want the cache to be as up to date as possible.

It's important to note that the refetchInterval timer is intelligent. If a traditional trigger occurs and updates the cache while the timer is counting down, the timer will reset

Another cool aspect of refetchInterval is you can continue polling until a certain condition is met. This comes in handy if you have an endpoint that performs an expensive task, and you want to poll until that task is finished.

For example, let's take an endpoint that crunches some numbers over a distributed system. First, it might return JSON that looked like this.

```JSON
{
  "total": 2341,
  "finished": false
}


but some time later, it could look like this.
{
  "total": 5723,
  "finished": true
}

```

Of course, it likely doesn't make sense to continue polling after the response tells us the computation has finished.

To accomplish this, you can pass a function to refetchInterval. When you do, that function will accept the query as an argument, allowing you to inspect the query's state and determine if the interval should continue. If you return false from the function you pass to refetchInterval, then the interval will be turned off.

So again, assuming we received a JSON response like the one above with an explicit finished property, our refetchInterval function would look like this.

```TS
useQuery({
  queryKey: ['totalAmount'],
  queryFn: () => fetchTotalAmount(),
  refetchInterval: (query) => {
    if (query.state.data?.finished) {
      return false
    }

    return 3000 // 3 seconds
  }
})

```

### Dependent Queries

it is not necessary for add one promise for each react hook, we can use any number
if we needed

```TS
function useMovieWithDirectorDetails(title) {
  return useQuery({
    queryKey: ['movie', title],
    queryFn: async () => {
      const movie = await fetchMovie(title)
      const director = await fetchDirector(movie.director)

      return { movie, director }
    },
  })
}
```

This works, but there is a tradeoff – it tightly couples our two requests together.

This can be a good thing - for example, we don't have to worry about separate loading or error states since we only have one query. However, it also means that the data is cached together and with that, comes some downsides.

1. They will always fetch and refetch together
   Because both requests are in the same query, even if we wanted to, we couldn't just refetch a portion of our data. For example, we can't refetch just the movie without also refetching the director.

For the same reason, we also can't set different configurations (like staleTime or refetchInterval) for each request.

As far as React Query is concerned, there is only one resource. It doesn't matter that it came from two network requests.

2. They will error together
   Even if just one of the two requests fail, the entire query will be in an error state.

This may be what you want, or you may still want to show some UI (like the movie information) even if the director's details couldn't be fetched.

3. There's no de-duplication for either request
   This is probably the biggest drawback. Because both requests are under the same queryKey, you have no way of knowing if certain data has already been fetched and cached elsewhere.

For example, if you have a second movie that was directed by the same person, you can't reuse the original data and there won't be any request de-duplication. Instead, we'd just make the same request again and store it elsewhere in the cache.

You can see this if you open up the devtools and look at the cache entries – both have the same director data, and two requests were made to get it.

Again this isn't always bad, but you should be conscious of the tradeoffs you're making when you decide to combine queries like this.

In this specific use case, it's probably best to take a different approach so you can avoid the tradeoffs listed above. The reason being, director is a totally different entity than movie. If we cache them separately, we'll have more flexibility in how we utilize them throughout our application.

In a way, you can think of dependent queries as a special form of fetching on demand. However, instead of delaying the query until an event occurs, you're delaying the query until another query has finished fetching.

To do this, let's first split up our useMovieWithDirectorDetails hook into two separate hooks: one for fetching the movie and one for fetching the director.

```TS
function useMovie(title) {
  return useQuery({
    queryKey: ['movie', title],
    queryFn: async () => fetchMovie(title),
  })
}

function useDirector(id) {
  return useQuery({
    queryKey: ['director', id],
    queryFn: async () => fetchDirector(id),
    enabled: id !== undefined
  })
}


function useMovieWithDirectorDetails(title) {
  const movie = useMovie(title)
  const directorId = movie.data?.director
  const director = useDirector(directorId)

  return {
    movie,
    director
  }
}
```

Notice that the query for useDirector is disabled when id is undefined. That's the key to making this work. We only want to fetch the director when we have an id to fetch it with.

Notice that the id that we're passing to useDirector comes from the movie query, and when that id is undefined (which will be the case when the movie query is still pending), the director query will be disabled.

Now, unlike before, we'll get separate cache entries for each movie, and a single entry for the director. This gives us total control over how we define and use each resources.

With these changes, we will have to handle two separate loading and error states, but again, that's usually a correct tradeoff to make since it's more flexible. Specifically in this example, it allows us to show our loading indicator and error message based on just the movie query – regardless of what happens with the director query.

### Parallel Queries

React Query has a bunch of ways to accomplish this, the simplest being to just call useQuery multiple times:

```TS
function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: fetchRepos,
  })
}

function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  })
}
```

Now when we call these custom hooks, React Query will trigger the fetches simultaneously and data will be displayed as soon as it's available, regardless of which query resolves first.

With this approach, we have two separate parts of the UI, each making its own query.

This works, but as is, our app has the traditional SPA like behavior of showing loading indicators across multiple parts of the UI, all of which will get replaced with data at different times. If you're not careful, this could lead to some jarring, layout shifting behavior.

If that's not necessary (or desired) and you'd rather wait until all the queries are done before rendering any of the UI, you have a few different options.

First, as you've seen before when we discussed dependent queries, you could combine the multiple fetch requests into a single query with the help of Promise.all.

```TS
function useReposAndMembers() {
  return useQuery({
    queryKey: ['reposAndMembers'],
    queryFn: () => {
      return Promise.all([fetchRepos(), fetchMembers()])
    }
  })
}
```

Now you'd have a consolidated loading state, error state, and data for both resources – making it easier to show a unified UI.

However, again as we saw in the dependent queries lesson, this approach has some downsides.

1. repos and members will always fetch and refetch together
2. repos and members will always error together
3. We can't re-use repos or members separately in other parts of our app
   Even though they have no correlation, we've cached and therefore coupled our two resources together. It works, and it's arguably easier to manage, but it comes at the cost of flexibility.

If you think about it, what we really want here is the ability to cache the resources separately, but still call them together in a unified hook. That combination would give us the
best of both worlds
.

This is essentially what the useQueries hook does.

You pass it an array of queries, and similar to Promise.all, it will run them in parallel and return an array of results where the order of the elements is the same as the order of the queries.

```TS
function useReposAndMembers() {
  return useQueries({
    queries: [
      {
        queryKey: ['repos'],
        queryFn: fetchRepos,
      },
      {
        queryKey: ['members'],
        queryFn: fetchMembers,
      }
    ]
  })
}

...

const [repos, members] = useReposAndMembers()
```

This gives you the flexibility of caching repos and members separately, with the convenience of a single hook.

And with the Power of JavaScript™, you can easily derive any value you need from the array.

For example, if you wanted to show a loading indicator while any of the queries were still fetching, you could derive that value like this

```TS
const queries = useReposAndMembers()

const areAnyPending = queries.some(
  query => query.status === 'pending'
)
```

Or if you only wanted to show a loading indicator while all of the queries were still fetching, you could derive that one like this.

```TS
const queries = useReposAndMembers()

const isAnyPending = queries.every(
  query => query.status === 'pending'
)
```

Regardless, you have the ability to inspect each query individually, while also being able to look at all of the queries as a whole.

we can do event more complex queryies with useQueries.

```TS
function useIssues(repos) {
  return useQueries({
    queries: repos?.map((repo) => ({
      queryKey: ['repos', repo.name, 'issues'],
      queryFn: async () => {
        const issues = await fetchIssues(repo.name)
        return { repo: repo.name, issues }
      }
    })) ?? []
  })
}
```

useQueries also comes with a combine option that does the same thing, just built in to the useQueries API itself.

The way it works is you pass combine a function that takes the array of queries as its first argument, and whatever it returns will be what useQueries returns.

```TS
function useIssues(repos) {
  return useQueries({
    queries: repos?.map((repo) => ({
      queryKey: ['repos', repo.name, 'issues'],
      queryFn: async () => {
        const issues = await fetchIssues(repo.name)
        return { repo: repo.name, issues }
      },
    })) ?? [],
    combine: (issues) => {
      const totalIssues = issues
        .map(({ data }) => data?.issues.length ?? 0)
        .reduce((a, b) => a + b, 0)

      return { issues, totalIssues }
    }
  })
}
```

### Pre fetching

Loading indicators are a foundational part of the experience of browsing the web. However, there are few things that can make an experience worse for your user than poorly implemented loading UIs.

Thankfully, React Query comes built-in with a few different APIs that either help you avoid loading indicators altogether, or make them more manageable when you can't.

To demonstrate these options, let's have a simple app that fetches some blog posts from the dev.to API, and displays them in a list that you can click through to see the full post.

```TS

function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 5000
  })
}

function usePost(path) {
  return useQuery({
    queryKey: ['posts', path],
    queryFn: () => fetchPost(path),
    staleTime: 5000
  })
}

function PostList({ setPath }) {
  const { status, data } = usePostList()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching posts</div>
  }

  return (
    <div>
      {data.map((post) => (
        <p key={post.id}>
          <a
            onClick={() => setPath(post.path)}
            href="#"
          >
            {post.title}
          </a>
          <br />
          {post.description}
        </p>
      ))}
    </div>
  )
}

function PostDetail({ path, setPath }) {
  const { status, data } = usePost(path)

  const back = (
    <div>
      <a onClick={() => setPath(undefined)} href="#">
        Back
      </a>
    </div>
  )

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return (
      <div>
        {back}
        Error fetching {path}
      </div>
    )
  }

  const html = markdownit().render(data?.body_markdown || "")

  return (
    <div>
      {back}
      <h1>{data.title}</h1>
      <div
        dangerouslySetInnerHTML={{__html: html}}
      />
    </div>
  )
}

export default function Blog() {
  const [path, setPath] = React.useState()

  return (
    <div>
      {path
        ? <PostDetail path={path} setPath={setPath} />
        : <PostList setPath={setPath} />
      }
    </div>
  )
}
```

Even without any optimizations, our app still performs pretty well due to the built in caching that React Query provides.

On the initial load of both the list view and the post detail view, we see our loading indicator. But after that, the data has been cached and we get our final UI instantly.

Unfortunately, the "initial load" is going to be a common occurrence for users of an app like this, and it's the biggest performance bottleneck we have. Can you think of a way that we can make it better?

What if, instead of waiting for the user to click on a link to fetch the data for the new route, we fetch it ahead of time? That way, when the user does click on the link, the data would already be available in the cache and they'd see the final UI instantly.

If you're not familiar, this technique is called prefetching and React Query supports it out of the box.

Of course, the trickiest part with prefetching is knowing when you should prefetch. It's tempting to just prefetch all the data that you might need, but that would lead to overfetching and would most likely cause performance issues.

For our app specifically, what we need is some sort of indicator that the user is interested in reading a specific post. If they are, then we can prefetch the data for that post so it's ready for them when they visit that page.

To do this, what if we Use The Platform™ and listen for the onMouseEnter event on the anchor tag that links to a post? It's a pretty safe assumption that when a user hovers over a link, they're probably going to click it.

Here's how that would look with React Query.

```TS
<a
  onClick={() => setPath(post.path)}
  href="#"
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['posts', post.path],
      queryFn: () => fetchPost(post.path),
      staleTime: 5000
    })
  }}
>
  {post.title}
</a>

```

queryClient.prefetchQuery is React Query's API to imperatively trigger a pre-fetch. It will execute the queryFn and store the result at the provided queryKey in the cache.

Since the only goal of the prefetch API is to get data into the cache, it doesn't return any data (just an empty Promise that you can await if you need to).

The biggest question you probably have with this code is where queryClient came from.

This is the same queryClient you initialized at the root of your app and passed to QueryClientProvider. You can get access to it via React Query's useQueryClient hook.

You may have noticed that the object we passed to prefetchQuery has the same shape (queryKey, queryFn, staleTime) as an object we'd pass to useQuery. Because of this, it's not a bad idea to abstract this object into a maker function that you can invoke whenever you need the query options. That way, you can easily use the same options for both useQuery and prefetchQuery.

```TS
function getPostQueryOptions(path) {
  return {
    queryKey: ['posts', path],
    queryFn: () => fetchPost(path),
    staleTime: 5000
  }
}

For TS
function getPostQueryOptions(path: string) {
  return queryOptions({
    queryKey: ['posts', path],
    queryFn: () => fetchPost(path),
    staletime: 5000,
  })
}

...

function usePost(path) {
  return useQuery(getPostQueryOptions(path))
}

...

<a
  onClick={() => setPath(post.path)}
  href="#"
  onMouseEnter={() => {
    queryClient.prefetchQuery(getPostQueryOptions(post.path))
  }}
>
  {post.title}
</a>
```

Here is how app behave

```TS
function getPostQueryOptions(path) {
  return {
    queryKey: ['posts', path],
    queryFn: () => fetchPost(path),
    staleTime: 5000
  }
}

function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 5000
  })
}

function usePost(path) {
  return useQuery(getPostQueryOptions(path))
}

function PostList({ setPath }) {
  const { status, data } = usePostList()
  const queryClient = useQueryClient()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching posts</div>
  }

  return (
    <div>
      {data.map((post) => (
        <p key={post.id}>
          <a
            onClick={() => setPath(post.path)}
            href="#"
            onMouseEnter={() => {
              queryClient.prefetchQuery(getPostQueryOptions(post.path))
            }}
          >
            {post.title}
          </a>
          <br />
          {post.description}
        </p>
      ))}
    </div>
  )
}

function PostDetail({ path, setPath }) {
  const { status, data } = usePost(path)

  const back = (
    <div>
      <a onClick={() => setPath(undefined)} href="#">
        Back
      </a>
    </div>
  )

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return (
      <div>
        {back}
        Error fetching {path}
      </div>
    )
  }

  const html = markdownit().render(data?.body_markdown || "")

  return (
    <div>
      {back}
      <h1>{data.title}</h1>
      <div
        dangerouslySetInnerHTML={{__html: html}}
      />
    </div>
  )
}

export default function Blog() {
  const [path, setPath] = React.useState()

  return (
    <div>
      {path
        ? <PostDetail path={path} setPath={setPath} />
        : <PostList setPath={setPath} />
      }
    </div>
  )
}
```

Notice that if you hover over a link, wait a bit and then click through, you won't see a loading indicator since the data for that post will already be in the cache.

You can see this even more clearly if you open up the devtools and then hover over a link. As soon as you do, a new entry will be added to the cache.

Now one question you may still have is why we also added a staleTime to our query. What's cool about prefetchQuery is that it respects the staleTime of the query you're prefetching. This means if there's already fresh data in the cache, React Query will just ignore the prefetch request all together.

If we didn't have a staleTime of 5000, every hover of the link would trigger a new request since the default staleTime in React Query is 0.

Along these same lines, if you wanted to only prefetch if there was no data in the cache, you could pass a staleTime of Infinity.

```TS
queryClient.prefetchQuery({
  ...getPostQueryOptions(post.path),
  staleTime: Infinity
})
```

Now clearly prefetching is a solid option for avoiding loading indicators, but it's not a silver bullet. There's still an asynchronous request happening, and in reality, you have no idea how long it will take to resolve. It's entirely likely that, even with prefetching, the user will still see a loading indicator if the response is slow.

This brings us to another potential optimization we can make: avoiding loading states all together.

In our example, before the user ever clicks through to the post page, we already have some of the data we need for it. Specifically, we have the id and title of the post. It's not all the data, but it may be enough to show a placeholder UI to the user while we wait for the rest of the data to load.

To do this, React Query has the concept of initialData.

If you pass initialData to useQuery, React Query will use whatever data is returned from it to initialize the cache entry for that query.

```TS
useQuery({
  queryKey,
  queryFn,
  initialData: () => {

  }
})
```

So as it relates to our example, what we need to figure out is how to get the specific post data out of the cache so that we can use it to initialize our post query.

```TS

function usePost(path) {
  return useQuery({
    ...getPostQueryOptions(path),
    initialData: () => {
      // return cache[path]?
    }
  })
}
```

Again, queryClient to the rescue.

Remember, the queryClient is what holds the cache. To access cached data directly, you can use queryClient.getQueryData. It takes the queryKey as an argument and will return whatever is in the cache for that entry.

So in our example, we can use queryClient.getQueryData(['posts']) to get the list of posts, and then use find to get the specific post we need to initialize the post cache.

```TS

unction usePost(path) {
  const queryClient = useQueryClient()

  return useQuery({
    ...getPostQueryOptions(path),
    initialData: () => {
      return queryClient.getQueryData(['posts'])
        ?.find((post) => post.path === path)
    }
  })
}
Typescript
// const postQueryOptions = queryOptions({
//   queryKey: ['posts'],
//   queryFn: fetchPosts,
//   staleTime: 5000
// })

// const data = queryClient.getQueryData(
//   postQueryOptions.queryKey
// )
```

Well, that didn't work. When we click a link, we only see the title and not the content of the post. Can you think of why that is? Take a look at the devtools for some hints.

Our PostDetail component tries to render data?.body_markdown, but when we look in the cache at our post, body_markdown doesn't exist - we only have the title and id available. It's no coincidence that that's the exact data we used to seed the cache.

Earlier we assumed that by giving React Query the data we already had, "it may be enough to show a placeholder UI to the user while we wait for the rest of the data to load."

Turns out, that's not how it works.

React Query sees the data we put into the cache via initialData the same as any other data. Meaning, by setting data via initialData with a staleTime of 5000, we're telling React Query that this data is good for 5 seconds and it doesn't need to invoke the queryFn again until then.

Unfortunately, the data is not good since we only have part of it. This is an obvious limitation of setting the initialData. It's a good option, but only if you have all of the data up front (which is rare).

What we're really looking for is a way to show a proper placeholder while we're fetching the actual data. Luckily, React Query comes with another option that is tailor-made for this problem – placeholderData.

placeholderData is similar to initialData, except the data you return from it won't get persisted to the cache. That's a subtle difference, but it means React Query will still invoke the queryFn to get the real data, and update the cache when it has it.

From a UI perspective, this is exactly what we were wanting. We can show the title of the post as a placeholder, and then when the real data comes in, we can update the UI with the full post.

And if we update our app by swapping initialData for placeholderData, here's how it would behave

```TS
function getPostQueryOptions(path) {
  return {
    queryKey: ['posts', path],
    queryFn: () => fetchPost(path),
    staleTime: 5000
  }
}

function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 5000
  })
}

function usePost(path) {
  const queryClient = useQueryClient()

  return useQuery({
    ...getPostQueryOptions(path),
    placeholderData: () => {
      return queryClient.getQueryData(['posts'])
        ?.find((post) => post.path === path)
    }
  })
}

function PostList({ setPath }) {
  const { status, data } = usePostList()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching posts</div>
  }

  return (
    <div>
      {data.map((post) => (
        <p key={post.id}>
          <a
            onClick={() => setPath(post.path)}
            href="#"
          >
            {post.title}
          </a>
          <br />
          {post.description}
        </p>
      ))}
    </div>
  )
}

function PostDetail({ path, setPath }) {
  const { status, data } = usePost(path)

  const back = (
    <div>
      <a onClick={() => setPath(undefined)} href="#">
        Back
      </a>
    </div>
  )

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return (
      <div>
        {back}
        Error fetching {path}
      </div>
    )
  }

  const html = markdownit().render(data?.body_markdown || "")

  return (
    <div>
      {back}
      <h1>{data.title}</h1>
      <div
        dangerouslySetInnerHTML={{__html: html}}
      />
    </div>
  )
}

export default function Blog() {
  const [path, setPath] = React.useState()

  return (
    <div>
      {path
        ? <PostDetail path={path} setPath={setPath} />
        : <PostList setPath={setPath} />
      }
    </div>
  )
}
```

That's better. The user is able to see the title instantly, and then when the background request finishes, the rest of the post is displayed.

Still, I think it can be better.

I know we've been trying to avoid it, but I do think showing a loading indicator (along with the title) to the user while we're fetching the rest of the post would be a good addition to our app. Thankfully, React Query makes this simple.

When you invoke useQuery passing it a placeholderData, it will give you back an isPlaceholderData boolean that will evaluate to true if the data the user is currently seeing is placeholder data.

We can use this in order to determine when we should show the loading indicator.

```TS

  if (status === 'pending') {
    return <div>...</div>
  }
```

And just to really tie it all together, let's add back in our prefetching logic so if the request is fast enough, the user will see the real entry right away, but if it's not, they'll see the title with the loading indicator until it resolves.

```TS
function getPostQueryOptions(path) {
  return {
    queryKey: ['posts', path],
    queryFn: () => fetchPost(path),
    staleTime: 5000
  }
}

function usePostList() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    staleTime: 5000
  })
}

function usePost(path) {
  const queryClient = useQueryClient()

  return useQuery({
    ...getPostQueryOptions(path),
    placeholderData: () => {
      return queryClient.getQueryData(['posts'])
        ?.find((post) => post.path === path)
    }
  })
}

function PostList({ setPath }) {
  const { status, data } = usePostList()
  const queryClient = useQueryClient()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching posts</div>
  }

  return (
    <div>
      {data.map((post) => (
        <p key={post.id}>
          <a
            onClick={() => setPath(post.path)}
            href="#"
            onMouseEnter={() => {
              queryClient.prefetchQuery(getPostQueryOptions(post.path))
            }}
          >
            {post.title}
          </a>
          <br />
          {post.description}
        </p>
      ))}
    </div>
  )
}

function PostDetail({ path, setPath }) {
  const { status, data, isPlaceholderData } = usePost(path)

  const back = (
    <div>
      <a onClick={() => setPath(undefined)} href="#">
        Back
      </a>
    </div>
  )

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return (
      <div>
        {back}
        Error fetching {path}
      </div>
    )
  }

  const html = markdownit().render(data?.body_markdown || "")

  return (
    <div>
      {back}
      <h1>{data.title}</h1>
      {isPlaceholderData
        ? <div>...</div>
        : <div dangerouslySetInnerHTML={{__html: html}} />}
    </div>
  )
}

export default function Blog() {
  const [path, setPath] = React.useState()

  return (
    <div>
      {path
        ? <PostDetail path={path} setPath={setPath} />
        : <PostList setPath={setPath} />
      }
    </div>
  )
}


```

### Pagination

```TS
export async function fetchRepos(sort, page) {
  const response = await fetch(
    `https://api.github.com/orgs/TanStack/repos
      ?sort=${sort}
      &per_page=4
      &page=${page}`
  )

  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`)
  }

  return response.json()
}
```

For page, we'll keep track of that as React state that the user can increment and decrement.

Let's have it live inside the parent Repos component, that way, via props, we can get access to it and modify it from within both the Sort and RepoList child components.

```TS
export default function Repos() {
  const [selection, setSelection] = React.useState('created')
  const [page, setPage] = React.useState(1)

  const handleSort = (sort) => {
    setSelection(sort)
    setPage(1)
  }

  return (
    <div>
      <Sort value={selection} onSort={handleSort} />
      <RepoList sort={selection} page={page} setPage={setPage} />
    </div>
  )
}
```

Let's improve it (again) by minimizing the amount of times the user sees our ... loading indicator. Instead of replacing the whole list of repos with the loading indicator when the user changes the page, what if we kept the old list around until the new list was ready?

This would minimize the amount of layout shift in our app and would make the experience feel a little more smooth.

To do this, we'll call back to an API we learned in the last lesson – placeholderData.

One thing we didn't talk in regards to placeholderData is that the function you pass to it will be passed the previous state of the query as its first argument.

```TS
useQuery({
  queryKey,
  queryFn,
  placeholderData: (previousData) => {

  }
})
```

What that means is that whenever the user changes the page, we can set the placeholderData for the query to be whatever the previous data was. This way, the user will see the old list of repos until the new list gets added to the cache.

```TS
function useRepos(sort, page) {
  return useQuery({
    queryKey: ['repos', { sort, page }],
    queryFn: () => fetchRepos(sort, page),
    staleTime: 10 * 1000,
    placeholderData: (previousData) => previousData
  })
}
```

```TS
function useRepos(sort, page) {
  return useQuery({
    queryKey: ['repos', { sort, page }],
    queryFn: () => fetchRepos(sort, page),
    staleTime: 10 * 1000,
    placeholderData: (previousData) => previousData
  })
}

function RepoList({ sort, page, setPage }) {
  const { data, status, isPlaceholderData } = useRepos(sort, page)

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>There was an error fetching the repos.</div>
  }

  return (
    <div>
      <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data.map((repo) =>
          <li key={repo.id}>{repo.full_name}</li>
        )}
      </ul>
      <div>
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default function Repos() {
  const [selection, setSelection] = React.useState('created')
  const [page, setPage] = React.useState(1)

  const handleSort = (sort) => {
    setSelection(sort)
    setPage(1)
  }

  return (
    <div>
      <Sort value={selection} onSort={handleSort} />
      <RepoList sort={selection} page={page} setPage={setPage} />
    </div>
  )
}

```

That's much better and the navigation between pages feels pretty good.

What's cool about this is it's not just for the pagination either. Notice what happens when you change the sort – you get the same behavior.

The reason for this is because, from React Query's perspective, all it cares about is if the queryKey changes. Whether that's via a change in the page or in the sort – it doesn't matter.

Now before this is ready to ship, there's still one more problem we need to take care of that you probably noticed – we're not doing a good job of disabling our buttons when appropriate.

Specifically, we want to disable the buttons while our application is fetching new data and when we've reached the end of the list.

For disabling when fetching, we already have access to isPlaceholderData which is exactly what we need.

```TS
function RepoList({ sort, page, setPage }) {
  const { data, status, isPlaceholderData } = useRepos(sort, page)

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>There was an error fetching the repos.</div>
  }

  return (
    <div>
      <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data.map((repo) =>
          <li key={repo.id}>{repo.full_name}</li>
        )}
      </ul>
      <div>
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={isPlaceholderData || page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          disabled={isPlaceholderData}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

Now inside of RepoList, all we have to do is import PAGE_SIZE and disable the "Next" button if the length of the data we get back is less than it.

```TS
function useRepos(sort, page) {
  return useQuery({
    queryKey: ['repos', { sort, page }],
    queryFn: () => fetchRepos(sort, page),
    staleTime: 10 * 1000,
    placeholderData: (previousData) => previousData
  })
}

function RepoList({ sort, page, setPage }) {
  const { data, status, isPlaceholderData } = useRepos(sort, page)

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>There was an error fetching the repos.</div>
  }

  return (
    <div>
      <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data.map((repo) =>
          <li key={repo.id}>{repo.full_name}</li>
        )}
      </ul>
      <div>
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={isPlaceholderData || page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          disabled={isPlaceholderData || data?.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default function Repos() {
  const [selection, setSelection] = React.useState('created')
  const [page, setPage] = React.useState(1)

  const handleSort = (sort) => {
    setSelection(sort)
    setPage(1)
  }

  return (
    <div>
      <Sort value={selection} onSort={handleSort} />
      <RepoList sort={selection} page={page} setPage={setPage} />
    </div>
  )
}
```

With that, we have a fully paginated experience!

Thanks to React Query's cache, clicking back and forth through pages is instant, and clicking to new pages will show the previous page while it loads, avoiding a jarring layout shift.

...but, for extra credit, is there a way we can make the experience even better?

What if we layered in another feature that we learned about in the last lesson, prefetching?

However, this time, instead of listening for onMouseEnter, what if we always prefetched the next page in the background? That way, whenever the user clicked "Next", the data would already be in the cache and they'd get the UI instantly.

To do this, let's first extract our query options for useRepos into a separate function so that we can reuse it.

```TS
function getReposQueryOptions(sort, page) {
  return {
    queryKey: ['repos', { sort, page }],
    queryFn: () => fetchRepos(sort, page),
    staleTime: 10 * 1000
  }
}

function useRepos(sort, page) {
  return useQuery({
    ...getReposQueryOptions(sort, page),
    placeholderData: (previousData) => previousData
  })
}
```

Now, inside of useRepos, let's add a useEffect hook that will prefetch the data for the next page.

```TS
function useRepos(sort, page) {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    queryClient.prefetchQuery(getReposQueryOptions(sort, page + 1))
  }, [sort, page, queryClient])

  return useQuery({
    ...getReposQueryOptions(sort, page),
    placeholderData: (previousData) => previousData
  })
}
```

## Infinite queries

Nearly 20 years ago, UI engineer Aza Raskin invented something he would later come to deeply regret – the infinite scroll. This pattern, which allows users to endlessly scroll through content, has since become a staple for social media platforms like Facebook, Pinterest, and Instagram.

This is exactly what React Query's useInfiniteQuery hook allows you to do. It works mostly the same as useQuery, but there are some fundamental differences.

When fetching data for both infinite lists and paginated lists, you fetch data over time in chunks. To do this, you need a way to figure out what you've already fetched, and what to fetch next.

Typically, as we saw in our Repos example, this is done via a page number.

With our pagination example, we created the page with React state, allowed the user to increment and decrement it via the UI, and then we passed it to our custom hook to use inside of the queryKey and queryFn.

With infinite lists and the useInfiniteQuery hook, the idea is the same, but the implementation is a little different. Instead of needing to manage the page in React state yourself, useInfiniteQuery will manage it for you.

Here's how it works.

Say we were fetching posts from the dev.to API again, and had a fetchPosts function that looked like this - where it took in the page to fetch.

```TS
export async function fetchPosts(page) {
  const url = `https://dev.to/api/articles?per_page=6&page=${page}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch posts for page #${page}`)
  }

  return response.json()
}
```

When invoking fetchPosts with an infinite list, you're mostly likely going to start at page 1 and increment from there.

With that said, if useInfiniteQuery is managing this page for us, it would make sense that we need to give it a few things in order to do that.

Specifically, we need to tell it what page to start at (1, in our case) and how to get to the next page.

To tell it what page to start at, you can give it an initialPageParam. This value will be passed to the queryFn the first time it's called so that you can pass it on to your API request.

```TS
function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 1,
  })
}
```

We haven't used it before, but React Query will always pass an object (called QueryFunctionContext) to the queryFn with information it has about the query itself.

As you can see, it's via the QueryFunctionContext that we can get access to the initial pageParam.

From here, all we need to do is to tell React Query how to get the next page.
We can do that by adding a getNextPageParam method to our options object.

```TS
function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {

    }
  })
}
```

When invoked, React Query will pass the getNextPageParam method three arguments, lastPage, allPages, and lastPageParam.

lastPage is the data from the last page fetched
allPages is an array of all the pages fetched so far
lastPageParam is the pageParam that was used to fetch the last page
Using these three arguments, you should be able to derive what the next page will be and return it. In our case, we'll take whatever the lastPageParam was an add 1 to it.

```TS
function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPageParam + 1
    }
  })
}
```

Additionally. if you want to tell React Query that there are no more pages left to fetch, you can return undefined.

In our example, if the last page we fetched was empty, it's a safe assumption that we're out of pages.

```TS
function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPageParam + 1
    }
  })
}

```

So at this point you know how to get data into the cache with useInfiniteQuery, but now how do you get it out?

This brings us to the other major difference between useQuery and useInfiniteQuery, the shape of the data it gives you.

With useQuery, you just get whatever data is in the cache at the queryKey. With useInfiniteQuery, it's often helpful to have both the data and the page that that data is associated with.

To do that, the object that useInfiniteQuery gives you look like this – where the data is separated into a multidimensional array of pages, with each element in the array being all the data for a specific page.

```JSON
{
 "data": {
   "pages": [
     [ {}, {}, {} ],
     [ {}, {}, {} ],
     [ {}, {}, {} ]
   ],
   "pageParams": [1, 2, 3]
 }
}
```

And if you'd prefer to have a normal, flat array, you can always use JavaScript's built-in Array.flat method to flatten the array of pages.

```TS
const { data } = usePosts()

const posts = data?.pages.flat() // [ {}, {}, {} ]11
```

And if we wanted, we could make our button more intelligent by giving it some meta information about the state of the query. Specifically,

isFetchingNextPage will be true when the request for the next page is in flight
hasNextPage will be true if there's another page to fetch. This is determined by calling getNextPageParam and checking if undefined was returned.

We can use both those values to disable our "More" button conditionally and to give it a loading indicator to while React Query is fetching the next page.

```TS
<button
  onClick={() => fetchNextPage()}
  disabled={!hasNextPage || isFetchingNextPage}
>
  { isFetchingNextPage ? '...' : 'More' }
</button>
```

And you don't only have to have infinite queries in a single direction. So far, we've only looked at queries that start at the beginning and then fetch forward to get more pages – but that might not always be the case.

For example, say you were building a messaging app that supported deep linking to any message. In that scenario, the user would find themselves in the middle of a conversation and would need to fetch both backwards and forwards to get the full context.

Thankfully, fetching backwards follows a similar pattern as fetching forwards, just with more appropriately named values.

```TS
useInfiniteQuery({
  queryKey,
  queryFn,
  initialPageParam,
  getNextPageParam: (lastPage, allPages, lastPageParam) => {
    if (lastPage.length === 0) {
      return undefined
    }

    return lastPageParam + 1
  }
  getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
    if (firstPageParam <= 1) {
      return undefined
    }

    return firstPageParam - 1
  }
})
```

add scrolling

```TS
import { useIntersectionObserver } from "@uidotdev/usehooks";

...

const [ref, entry] = useIntersectionObserver();

```

```TS
function usePosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    staleTime: 5000,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined
      }

      return lastPageParam + 1
    }
  })
}

export default function Blog() {
  const { status, data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts()

  const [ref, entry] = useIntersectionObserver();

  React.useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage])

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching posts</div>
  }

  return (
    <div>
      {data.pages.flat().map((post, index, pages) => (
        <p key={post.id}>
          <b>{post.title}</b>
          <br />
          {post.description}
          {index === pages.length - 3
              ? <div ref={ref} />
              : null}
        </p>
      ))}
    </div>
  )
}
```

One of the most valuable aspects of React Query is that it keeps your data up to date in the background with automatic refetches. This ensures that the data the user sees is always fresh.

But how does refetching work with infinite queries?

The idea is pretty straight forward – React Query refetches the first page in the cache (regardless of what initialPageParam is), calls getNextPageParam to get the next page, and then fetches that page. This process continues until all pages have been refetched or until undefined is returned from getNextPageParam.

It works this way for one important reason – Consistency.

An infinite query is only one cache entry, so while each page is a separate fetch, they eventually form one long list in our UI. If we were to only refetch some of the queries, React Query couldn't guarantee consistency.

For example, let's consider that we have two pages in the cache with a pageSize of 4. The first page shows ids 1 through 4, the second shows ids 5 through 8.

If id 3 was deleted on the backend, and we only refetched page 1, our page 2 would be out of sync and both pages would have a duplicate entry of 5 in the cache.
On the other hand, if an entry was added on page 1, let's say with an id of 0, and we only fetched page 1, then the page with an id of 4 would be missing from the cache.

All this to say, React Query can't take any shortcuts when it comes to refetches of infinite queries – it always has to fetch all the pages to guarantee consistency.

As you can imagine, if there were a lot of pages in the cache, this could be problematic both from a network and a memory perspective.

To avoid this problem, you can give useInfiniteQuery a maxPages option that limits the number of pages that React Query will keep in the cache.

So for example, if you had a maxPages of 3, even if you had bi-directional infinite queries, React Query would (intelligently) only keep three pages in the cache.

useInfiniteQuery might be a bit more complicated than useQuery, but the user experiences it enables would be incredibly difficult without it.

Like everything else in React Query, with just a bit of configuration, useInfiniteQuery handles the complexities of cache management for you, letting you focus on what really matters – building a great user experience.
