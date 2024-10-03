<template>
    <div>
      <div v-if="pokemon">
        <h2>{{ capitalizedPokemonName }}</h2>
        <img :src="pokemon.sprites.front_default" alt="Pokemon image" />
        <p>Altura: {{ pokemon.height }}</p>
        <p>Peso: {{ pokemon.weight }}</p>
        <p>Tipo: 
          <span v-for="type in pokemon.types" :key="type.slot">{{ type.type.name }} </span>
        </p>
      </div>
  
      <div v-else>
        <p>Loading...</p>
      </div>
  
      <div v-if="errorMessage" class="error">
        <p>{{ errorMessage }}</p>
      </div>
  
      <input v-model="pokemonId" @keyup.enter="fetchPokemon" placeholder="Numero del Puchamon?" />
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        pokemon: null,
        pokemonId: 1,
        errorMessage: null,
      };
    },
    computed: {
      capitalizedPokemonName() {
        if (this.pokemon && this.pokemon.name) {
          return this.pokemon.name.charAt(0).toUpperCase() + this.pokemon.name.slice(1);
        }
        return '';
      }
    },
    methods: {
      async fetchPokemon() {
        try {
          const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${this.pokemonId}`);
          this.pokemon = response.data;
          this.errorMessage = null;
        } catch (error) {
          this.pokemon = null;
          this.errorMessage = 'Y ese puchamon? escriba bien el numero';
        }
      }
    },
    mounted() {
      this.fetchPokemon();
    }
  };
  </script>
  
  <style scoped>
  .error {
    color: red;
    font-weight: bold;
  }
  </style>
  