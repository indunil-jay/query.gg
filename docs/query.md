# UseQuery() Hook

the primary way you'll be interacting with the cache is via the `useQuery hook`.Under the hood, `useQuery` will `subscribe` to the `QueryCache` and re-render whenever the `data it cares about in the cache changes`.

Naturally, this brings up a couple questions.

1. How does it know which data it cares about?
2. How does it know where to get that data from?

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

- If the value exists, it is returned immediately without re-fetching the data.
- If the value does not exist, React Query runs the queryFn, stores the resolved value in the cache, and then returns it.

Even when useQuery invocations occur in different components, the same logic applies. React Query’s global cache ensures that data is consistently shared across components, reducing redundant fetches and optimizing application performance.

By abstracting away cache management, React Query simplifies data fetching, promotes reusability, and ensures efficiency in handling queries.

## Leveraging the Observer Pattern in React Query

React Query’s ability to simplify complex asynchronous logic into reusable, synchronous-like hooks is powered by its use of `Query Observers` and the `Observer Pattern`. This design pattern is `key` to how React Query keeps your UI synchronized with its global cache.

### How It Works

The cache in React Query exists outside of React, so a mechanism is needed to keep the data in the cache aligned with React components. Observers serve as the link between your components and the queries stored in the cache.

Here’s the process:

- **Creating Observers:** Each time a component mounts and calls useQuery, it creates an observer tied to a specific queryKey.
- **Watching the Cache:** The observer monitors the cache for changes related to its assigned queryKey.
- **Re-rendering Components:** When the cache updates, the observer is notified, triggering a re-render of the component. This ensures the UI always reflects the most recent data.

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

- loading: The query is in progress, and data is not yet available.
- success: The query has completed successfully, and data is available.
- error: The query has failed, and error information is accessible.

Understanding these states is crucial for handling asynchronous data correctly in your components.
Solutions: Handling Query States

React Query provides two primary ways to handle these states and ensure the UI reflects the query’s lifecycle seamlessly:

- Using the status Property
- Using Derived Boolean Flags

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

- status === 'pending': While the data is being fetched, display a loading indicator.
- status === 'error': If the fetch fails, show an error message.
- Default ('success'): Once data is successfully fetched, render the list of to-dos.

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

- isLoading: Indicates that the query is currently loading.
- isError: Indicates that the query encountered an error.
- Default (isSuccess): When neither isLoading nor isError is true, the data has been successfully fetched.

##### Which Approach to Choose?

Both methods are equally valid and effective. The choice between using status or the boolean flags (isLoading, isSuccess, isError) depends on your coding style and team preferences. Here are some considerations:

- Readability: Boolean flags can make conditional checks more readable and intuitive.
- Flexibility: Using status can be beneficial if you need to handle additional states or have more complex logic based on the query's status.

Recommendation: Whichever approach you choose, consistently handle query states across your components to ensure a robust and error-free application.

By leveraging React Query's query lifecycle management, you can handle asynchronous data fetching gracefully and efficiently. Whether you choose to use the status property or the boolean flags, React Query provides the tools necessary to ensure your UI remains in sync with your data.

This approach not only enhances the predictability of your application by ensuring that every component reflects the exact state of the data in the cache but also optimizes performance by minimizing unnecessary network requests. Additionally, because the cache is global, any component within the QueryClientProvider can access and share the same cached data, promoting consistency and reusability across your application.

Embracing React Query's lifecycle management allows you to build robust, responsive, and maintainable applications with ease

### Query Dependencies
