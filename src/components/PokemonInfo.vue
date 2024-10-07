<template>
  <div class="pokemon-container">
    <div class="pokemon-list">
      <div v-for="pokemon in pokemonList" :key="pokemon.name" class="pokemon-card">
        <h2>{{ capitalizeName(pokemon.name) }}</h2>
        <img v-if="pokemon.sprite" :src="pokemon.sprite" :alt="`Imagen de ${pokemon.name}`" class="pokemon-image" />

        <!-- Detalles del Pokémon -->
        <div class="pokemon-details">
          <p>Altura: {{ pokemon.height }} dm</p>
          <p>Peso: {{ pokemon.weight }} hg</p>
          <p>Tipo:
            <span v-for="type in pokemon.types" :key="type.slot" class="pokemon-type">{{ capitalizeName(type.type.name)
              }}</span>
          </p>
        </div>
      </div>
    </div>

    <div class="pagination">
      <button @click="previousPage" :disabled="!previousPageUrl" class="pagination-button">Anterior</button>
      <button @click="nextPage" :disabled="!nextPageUrl" class="pagination-button">Siguiente</button>
    </div>
  </div>
</template>

<script>
import pokemonComponent from './pokemonComponent.js';
export default {
  mixins: [pokemonComponent],
};
</script>

<style scoped>
@import './pokemonComponent.css';
</style>
