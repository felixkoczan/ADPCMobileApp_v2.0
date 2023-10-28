<script lang="ts">
let name = "Felix";
let age = 35;
let warning = null;


const increaseAge = () => {
  age +=1;
}

const decreaseAge = () => {
  age -=1;
}

$: uppercase = name.toUpperCase();

$: if (age > 40) {
  warning = "Zu alt";
} else {
  warning = "Alles gut"
}

</script>

<main>
  <h3>Vite + Svelte</h3>
  <p>{name}</p>
  <p>{age}</p>
  <p>{uppercase}</p>
  {#if age > 10}
  <p>Du bist zu alt</p>
  {:else}
  <p>Du bist zu jung</p>
  {/if}
  <p>{warning}</p>
  <button on:click={increaseAge}>Increase Age</button>
  <button on:click={decreaseAge}>Decrease Age</button>
  <input type="text" bind:value={name}>
</main>

<style>
  .warning {
    color: white;
    background-color: darkred;
  }

  .ok {
    color: white;
    background-color: darkgreen;
  }

</style>

