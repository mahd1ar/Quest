<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>
      <vs-button :active="active == 0" @click="active = 0">Active</vs-button>
      <vs-button :active="active == 1" @click="active = 1">Default</vs-button>
      <vs-button disabled>Disabled</vs-button>
    </div>
    <vs-card type="2">
      <template #title>
        <h3>Pot with a plant</h3>
      </template>
      <template #img>
        <img src="@/resource/cover.jpeg" alt="" />
      </template>
      <template #text>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit.
        </p>
      </template>
      <template #interactions>
        <vs-button danger icon>
          <i class="bx bx-heart"></i>
        </vs-button>
        <vs-button class="btn-chat" shadow primary>
          <i class="bx bx-chat"></i>
          <span class="span">
            54
          </span>
        </vs-button>
      </template>
    </vs-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    active: 0
  })
};
</script>

<style></style>
